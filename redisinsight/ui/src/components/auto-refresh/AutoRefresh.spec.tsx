import React from 'react'
import { instance, mock } from 'ts-mockito'
import {
  userEvent,
  fireEvent,
  screen,
  render,
  act,
  waitForRiPopoverVisible,
} from 'uiSrc/utils/test-utils'
import { localStorageService } from 'uiSrc/services'
import AutoRefresh, { Props } from './AutoRefresh'
import { DEFAULT_REFRESH_RATE } from './utils'

const mockedProps = mock<Props>()

const INLINE_ITEM_EDITOR = 'inline-item-editor'

describe('AutoRefresh', () => {
  beforeEach(() => {
    // Clear any stored refresh rate before each test
    jest.clearAllMocks()
    jest.spyOn(localStorageService, 'get').mockImplementation(() => null)
  })
  it('should render', () => {
    expect(render(<AutoRefresh {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('prop "displayText = true" should show Refresh text', () => {
    const { queryByTestId } = render(
      <AutoRefresh {...instance(mockedProps)} displayText />,
    )

    expect(queryByTestId('refresh-message-label')).toBeInTheDocument()
  })

  it('prop "displayText = false" should hide Refresh text', () => {
    const { queryByTestId } = render(
      <AutoRefresh {...instance(mockedProps)} displayText={false} />,
    )

    expect(queryByTestId('refresh-message-label')).not.toBeInTheDocument()
  })

  it('prop "displayLastRefresh = true" should show refresh time message', () => {
    const { queryByTestId } = render(
      <AutoRefresh {...instance(mockedProps)} displayLastRefresh />,
    )

    expect(queryByTestId('refresh-message')).toBeInTheDocument()
  })

  it('prop "displayLastRefresh = false" should hide refresh time message', () => {
    const { queryByTestId } = render(
      <AutoRefresh {...instance(mockedProps)} displayLastRefresh={false} />,
    )

    expect(queryByTestId('refresh-message')).not.toBeInTheDocument()
  })

  it('should call onRefresh', () => {
    const onRefresh = jest.fn()
    render(<AutoRefresh {...instance(mockedProps)} onRefresh={onRefresh} />)

    fireEvent.click(screen.getByTestId('refresh-btn'))
    expect(onRefresh).toHaveBeenCalled()
  })

  it('refresh text should contain "Last refresh" time with disabled auto-refresh', async () => {
    render(<AutoRefresh {...instance(mockedProps)} displayText />)

    expect(screen.getByTestId('refresh-message-label')).toHaveTextContent(
      /Last refresh:/i,
    )
    expect(screen.getByTestId('refresh-message')).toHaveTextContent('now')
  })

  it('refresh text should contain "Auto-refresh" time with enabled auto-refresh', async () => {
    render(<AutoRefresh {...instance(mockedProps)} displayText />)

    await userEvent.click(screen.getByTestId('auto-refresh-config-btn'))
    await waitForRiPopoverVisible()
    await userEvent.click(screen.getByTestId('auto-refresh-switch'))

    expect(screen.getByTestId('refresh-message-label')).toHaveTextContent(
      /Auto refresh:/i,
    )
    expect(screen.getByTestId('refresh-message')).toHaveTextContent(
      DEFAULT_REFRESH_RATE,
    )
  })

  it('should locate refresh message label when testid is provided', () => {
    render(
      <AutoRefresh {...instance(mockedProps)} displayText testid="testid" />,
    )

    expect(
      screen.getByTestId('testid-refresh-message-label'),
    ).toBeInTheDocument()
  })

  it('should locate refresh message when testid is provided', () => {
    render(
      <AutoRefresh {...instance(mockedProps)} displayText testid="testid" />,
    )

    expect(screen.getByTestId('testid-refresh-message')).toBeInTheDocument()
  })

  it('should locate refresh button when testid is provided', () => {
    render(<AutoRefresh {...instance(mockedProps)} testid="testid" />)

    expect(screen.getByTestId('testid-refresh-btn')).toBeInTheDocument()
  })

  it('should locate auto-refresh config button when testid is provided', () => {
    render(<AutoRefresh {...instance(mockedProps)} testid="testid" />)

    expect(
      screen.getByTestId('testid-auto-refresh-config-btn'),
    ).toBeInTheDocument()
  })

  it('should locate auto-refresh switch when testid is provided', () => {
    render(<AutoRefresh {...instance(mockedProps)} testid="testid" />)

    fireEvent.click(screen.getByTestId('testid-auto-refresh-config-btn'))
    expect(screen.getByTestId('testid-auto-refresh-switch')).toBeInTheDocument()
  })

  it('should locate refresh rate when testid is provided', () => {
    render(<AutoRefresh {...instance(mockedProps)} testid="testid" />)

    fireEvent.click(screen.getByTestId('testid-auto-refresh-config-btn'))
    expect(screen.getByTestId('testid-refresh-rate')).toBeInTheDocument()
  })

  it('should locate auto-refresh rate input when testid is provided', () => {
    render(<AutoRefresh {...instance(mockedProps)} testid="testid" />)

    fireEvent.click(screen.getByTestId('testid-auto-refresh-config-btn'))
    fireEvent.click(screen.getByTestId('testid-refresh-rate'))
    expect(
      screen.getByTestId('testid-auto-refresh-rate-input'),
    ).toBeInTheDocument()
  })

  describe('AutoRefresh Config', () => {
    it('Auto refresh config should render', () => {
      const { queryByTestId } = render(
        <AutoRefresh {...instance(mockedProps)} />,
      )

      fireEvent.click(screen.getByTestId('auto-refresh-config-btn'))
      expect(queryByTestId('auto-refresh-switch')).toBeInTheDocument()
    })

    it('should call onRefresh after enable auto-refresh and set 1 sec', async () => {
      const onRefresh = jest.fn()
      render(<AutoRefresh {...instance(mockedProps)} onRefresh={onRefresh} />)

      await userEvent.click(screen.getByTestId('auto-refresh-config-btn'))
      await waitForRiPopoverVisible()
      await userEvent.click(screen.getByTestId('auto-refresh-switch'))
      fireEvent.click(screen.getByTestId('refresh-rate'))

      fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), {
        target: { value: '1' },
      })
      expect(screen.getByTestId(INLINE_ITEM_EDITOR)).toHaveValue('1')

      await userEvent.click(screen.getByTestId(/apply-btn/))
      // screen.getByTestId(/apply-btn/).click()

      await act(async () => {
        await new Promise((r) => setTimeout(r, 1300))
      })
      expect(onRefresh).toHaveBeenCalledTimes(1)

      await act(async () => {
        await new Promise((r) => setTimeout(r, 1300))
      })
      expect(onRefresh).toHaveBeenCalledTimes(2)

      await act(async () => {
        await new Promise((r) => setTimeout(r, 1300))
      })
      expect(onRefresh).toHaveBeenCalledTimes(3)
    })

    it('should respect minimumRefreshRate when setting refresh rate', async () => {
      const onChangeAutoRefreshRate = jest.fn()
      const minimumRefreshRate = 6
      render(
        <AutoRefresh
          {...instance(mockedProps)}
          minimumRefreshRate={minimumRefreshRate}
          onChangeAutoRefreshRate={onChangeAutoRefreshRate}
        />,
      )

      fireEvent.click(screen.getByTestId('auto-refresh-config-btn'))
      fireEvent.click(screen.getByTestId('refresh-rate'))
      fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), {
        target: { value: (minimumRefreshRate / 2).toString() },
      })
      screen.getByTestId(/apply-btn/).click()
      expect(onChangeAutoRefreshRate).toHaveBeenLastCalledWith(
        false,
        minimumRefreshRate.toString(),
      )
    })

    it('should allow valid refresh rates above minimumRefreshRate', async () => {
      const onChangeAutoRefreshRate = jest.fn()
      const minimumRefreshRate = 6
      render(
        <AutoRefresh
          {...instance(mockedProps)}
          minimumRefreshRate={minimumRefreshRate}
          onChangeAutoRefreshRate={onChangeAutoRefreshRate}
        />,
      )

      fireEvent.click(screen.getByTestId('auto-refresh-config-btn'))
      fireEvent.click(screen.getByTestId('refresh-rate'))
      fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), {
        target: { value: (minimumRefreshRate * 2).toString() },
      })
      screen.getByTestId(/apply-btn/).click()

      expect(onChangeAutoRefreshRate).toHaveBeenLastCalledWith(
        false,
        (minimumRefreshRate * 2).toString(),
      )
    })

    it('should use defaultRefreshRate when provided', () => {
      const customDefaultRate = '30'
      render(
        <AutoRefresh
          {...instance(mockedProps)}
          defaultRefreshRate={customDefaultRate}
        />,
      )

      fireEvent.click(screen.getByTestId('auto-refresh-config-btn'))
      expect(screen.getByTestId('refresh-rate')).toHaveTextContent(
        `${customDefaultRate} s`,
      )
    })

    it('should use DEFAULT_REFRESH_RATE when defaultRefreshRate is not provided', () => {
      render(<AutoRefresh {...instance(mockedProps)} />)

      // Open config and check default value
      fireEvent.click(screen.getByTestId('auto-refresh-config-btn'))
      expect(screen.getByTestId('refresh-rate')).toHaveTextContent(
        `${DEFAULT_REFRESH_RATE} s`,
      )
    })
  })

  it('should NOT call onRefresh with disabled state', async () => {
    const onRefresh = jest.fn()
    const { rerender } = render(
      <AutoRefresh {...instance(mockedProps)} onRefresh={onRefresh} />,
    )

    await userEvent.click(screen.getByTestId('auto-refresh-config-btn'))
    await waitForRiPopoverVisible()
    await userEvent.click(screen.getByTestId('auto-refresh-switch'))
    fireEvent.click(screen.getByTestId('refresh-rate'))
    fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), {
      target: { value: '1' },
    })

    expect(screen.getByTestId(INLINE_ITEM_EDITOR)).toHaveValue('1')

    screen.getByTestId(/apply-btn/).click()

    await act(async () => {
      rerender(
        <AutoRefresh
          {...instance(mockedProps)}
          onRefresh={onRefresh}
          disabled
        />,
      )
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 1300))
    })
    expect(onRefresh).toHaveBeenCalledTimes(0)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 1300))
    })
    expect(onRefresh).toHaveBeenCalledTimes(0)

    await act(async () => {
      rerender(
        <AutoRefresh
          {...instance(mockedProps)}
          onRefresh={onRefresh}
          disabled={false}
        />,
      )
    })

    await act(async () => {
      await new Promise((r) => setTimeout(r, 1300))
    })
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('refresh tooltip text should contain disabled refresh button reason message when button disabled', async () => {
    const tooltipText = 'some-disabled-message'
    render(
      <AutoRefresh
        {...instance(mockedProps)}
        disabled
        disabledRefreshButtonMessage={tooltipText}
      />,
    )

    fireEvent.focus(screen.getByTestId('refresh-btn'))
    await screen.findByTestId('refresh-tooltip')
    expect(screen.getByTestId('refresh-tooltip')).toHaveTextContent(
      new RegExp(`^${tooltipText}`),
    )
  })
})
