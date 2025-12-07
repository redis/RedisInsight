import React from 'react'
import { instance, mock } from 'ts-mockito'
import reactRouterDom from 'react-router-dom'
import { fireEvent, render, screen, act } from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'
import { setDBConfigStorageField } from 'uiSrc/services'
import { ConfigDBStorageItem } from 'uiSrc/constants/storage'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import CodeButtonBlock, { Props } from './CodeButtonBlock'

const mockedProps = mock<Props>()

const simpleContent = 'info'
const label = 'btn'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  setDBConfigStorageField: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

describe('CodeButtonBlock', () => {
  it('should render', () => {
    const component = render(
      <CodeButtonBlock
        {...instance(mockedProps)}
        label={label}
        content={simpleContent}
      />,
    )
    const { container } = component

    expect(component).toBeTruthy()
    expect(container).toHaveTextContent(label)
    expect(container).toHaveTextContent(simpleContent)
  })

  it('should call onClick function', () => {
    const onApply = jest.fn()
    render(
      <CodeButtonBlock
        {...instance(mockedProps)}
        label={label}
        onApply={onApply}
        content={simpleContent}
      />,
    )
    fireEvent.click(screen.getByTestId(`run-btn-${label}`))

    expect(onApply).toBeCalled()
  })

  it('should call onCopy function', () => {
    const onCopy = jest.fn()

    render(
      <CodeButtonBlock
        {...instance(mockedProps)}
        label={label}
        onCopy={onCopy}
        onApply={jest.fn()}
        content={simpleContent}
      />,
    )
    fireEvent.click(screen.getByTestId(`copy-btn-${label}`))

    expect(onCopy).toBeCalled()
  })

  it('should call onApply with provided params', () => {
    const onApply = jest.fn()

    render(
      <CodeButtonBlock
        {...instance(mockedProps)}
        label={label}
        onApply={onApply}
        params={{ pipeline: '10' }}
        content={simpleContent}
      />,
    )
    fireEvent.click(screen.getByTestId(`run-btn-${label}`))

    expect(onApply).toBeCalledWith({ pipeline: '10' }, expect.any(Function))
  })

  it('should not render run button with executable=false param', () => {
    const onApply = jest.fn()

    render(
      <CodeButtonBlock
        {...instance(mockedProps)}
        label={label}
        onApply={onApply}
        params={{ executable: 'false' }}
        content={simpleContent}
      />,
    )

    expect(screen.queryByTestId(`run-btn-${label}`)).not.toBeInTheDocument()
  })

  it('should not show confirmation popover with option', async () => {
    render(
      <CodeButtonBlock
        {...instance(mockedProps)}
        label={label}
        onApply={jest.fn}
        params={{ run_confirmation: 'true' }}
        content={simpleContent}
        isShowConfirmation={false}
      />,
    )
    await act(() => {
      fireEvent.click(screen.getByTestId(`run-btn-${label}`))
    })

    expect(
      screen.queryByTestId('tutorial-popover-apply-run'),
    ).not.toBeInTheDocument()
  })

  it('should go to home page after click on change db', async () => {
    const pushMock = jest.fn()
    reactRouterDom.useHistory = jest.fn().mockReturnValue({ push: pushMock })

    const onApply = jest.fn()

    render(
      <CodeButtonBlock
        {...instance(mockedProps)}
        label={label}
        onApply={onApply}
        params={{ run_confirmation: 'true' }}
        content={simpleContent}
      />,
    )
    await act(() => {
      fireEvent.click(screen.getByTestId(`run-btn-${label}`))
    })

    fireEvent.click(screen.getByTestId('tutorial-popover-change-db'))

    expect(pushMock).toBeCalledWith(Pages.home)
  })

  it('should set show confirmation to LS', async () => {
    const onApply = jest.fn()

    render(
      <CodeButtonBlock
        {...instance(mockedProps)}
        label={label}
        onApply={onApply}
        params={{ run_confirmation: 'true' }}
        content={simpleContent}
      />,
    )

    await act(() => {
      fireEvent.click(screen.getByTestId(`run-btn-${label}`))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('checkbox-show-again'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('tutorial-popover-apply-run'))
    })

    expect(setDBConfigStorageField).toBeCalledWith(
      'instanceId',
      ConfigDBStorageItem.notShowConfirmationRunTutorial,
      true,
    )
  })

  it('should call proper telemetry on click change db', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    const onApply = jest.fn()

    render(
      <CodeButtonBlock
        {...instance(mockedProps)}
        label={label}
        onApply={onApply}
        params={{ run_confirmation: 'true' }}
        content={simpleContent}
      />,
    )
    await act(() => {
      fireEvent.click(screen.getByTestId(`run-btn-${label}`))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('tutorial-popover-change-db'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.EXPLORE_PANEL_DATABASE_CHANGE_CLICKED,
      eventData: {
        databaseId: 'instanceId',
      },
    })
  })

  it('should call popover with no module loaded', async () => {
    const onApply = jest.fn()

    render(
      <CodeButtonBlock
        {...instance(mockedProps)}
        label={label}
        onApply={onApply}
        params={{ run_confirmation: 'false' }}
        content="ft.info"
      />,
    )
    await act(() => {
      fireEvent.click(screen.getByTestId(`run-btn-${label}`))
    })

    expect(screen.getByTestId('module-not-loaded-popover')).toBeInTheDocument()
  })

  it('should call not opened db popover without instanceId', async () => {
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: undefined })
    const onApply = jest.fn()

    render(
      <CodeButtonBlock
        {...instance(mockedProps)}
        label={label}
        onApply={onApply}
        params={{ run_confirmation: 'false' }}
        content={simpleContent}
      />,
    )
    await act(() => {
      fireEvent.click(screen.getByTestId(`run-btn-${label}`))
    })

    expect(
      screen.getByTestId('database-not-opened-popover'),
    ).toBeInTheDocument()
  })
})
