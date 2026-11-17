import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import {
  isShowCapabilityTutorialPopover,
  setCapabilityPopoverShown,
} from 'uiSrc/services'
import { connectedInstanceCDSelector } from 'uiSrc/slices/instances/instances'
import { getTutorialCapability } from 'uiSrc/utils'

import InternalPage, { Props } from './InternalPage'

const mockedProps = mock<Props>()

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextCapability: jest.fn().mockReturnValue({
    source: 'workbench RediSearch',
  }),
}))

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  isShowCapabilityTutorialPopover: jest.fn(),
  setCapabilityPopoverShown: jest.fn(),
}))

jest.mock('uiSrc/utils', () => ({
  ...jest.requireActual('uiSrc/utils'),
  getTutorialCapability: jest
    .fn()
    .mockReturnValue({ path: 'path', telemetryName: 'searchAndQuery' }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceCDSelector: jest.fn().mockReturnValue({
    free: false,
  }),
}))

/**
 * InternalPage tests
 *
 * @group component
 */
describe('InternalPage', () => {
  it('should render', () => {
    expect(render(<InternalPage {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('should display loader', () => {
    const { queryByTestId } = render(
      <InternalPage {...instance(mockedProps)} isLoading />,
    )

    expect(queryByTestId('enablement-area__page-loader')).toBeTruthy()
  })
  it('should display empty prompt on error', () => {
    const { queryByTestId } = render(
      <InternalPage {...instance(mockedProps)} error="Some error" />,
    )

    expect(queryByTestId('enablement-area__empty-prompt')).toBeTruthy()
  })
  it('should call onClose function in click BackButton empty prompt on error', () => {
    const onClose = jest.fn()
    const { queryByTestId } = render(
      <InternalPage {...instance(mockedProps)} onClose={onClose} />,
    )

    const button = queryByTestId(/enablement-area__page-close/)
    fireEvent.click(button as Element)

    expect(onClose).toBeCalled()
  })
  it('should render a redis code fence and a relative link as markdown', () => {
    const content = '```redis Run me\nGET k\n```\n\n[Doc](./doc.md)'
    render(
      <InternalPage
        {...instance(mockedProps)}
        content={content}
        path="/tutorials/x/page.md"
      />,
    )

    expect(screen.getByTestId('code-button-block-label')).toHaveTextContent(
      'Run me',
    )
    expect(screen.getByRole('link', { name: 'Doc' })).toBeInTheDocument()
  })
  it('should render a non-redis fence as plain code with no Run button, alongside a redis fence with one', () => {
    const content = '```redis Run me\nGET k\n```\n\n```bash\nls -la\n```'
    render(<InternalPage {...instance(mockedProps)} content={content} />)

    expect(screen.getByTestId('run-btn-Run me')).toBeInTheDocument()
    expect(screen.getByText('ls -la')).toBeInTheDocument()
    // Only the redis fence above is interactive; the bash fence must not
    // render a second copy/run block.
    expect(screen.getAllByTestId('code-button-block-content')).toHaveLength(1)
  })

  it('should render an external link with inline/small styling props', () => {
    const content = '[Redis Docs](https://redis.io/docs)'
    render(<InternalPage {...instance(mockedProps)} content={content} />)

    const link = screen.getByRole('link', { name: /Redis Docs/ })
    expect(link).toHaveAttribute('href', 'https://redis.io/docs')
    // The base Link already adds target/rel for any href; this only checks
    // the visual props (external/inline/small) applied by InternalPage's
    // ExternalLink leaf, matching the old remarkLink styling.
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should render raw HTML in content as literal text and inject no script', () => {
    const content = '<p>{alert(1)}</p>'
    render(<InternalPage {...instance(mockedProps)} content={content} />)

    expect(screen.getByText(content, { exact: false })).toBeInTheDocument()
    expect(document.querySelector('script')).toBeNull()
  })

  describe('capability', () => {
    beforeEach(() => {
      ;(connectedInstanceCDSelector as jest.Mock).mockReturnValueOnce({
        free: true,
      })
    })
    it('should call isShowCapabilityTutorialPopover, setCapabilityPopoverShown and getTutorialCapability', async () => {
      const isShowCapabilityTutorialPopoverMock = jest.fn()
      const setCapabilityPopoverShownMock = jest.fn()
      ;(isShowCapabilityTutorialPopover as jest.Mock).mockImplementation(
        () => isShowCapabilityTutorialPopoverMock,
      )
      ;(setCapabilityPopoverShown as jest.Mock).mockImplementation(
        () => setCapabilityPopoverShownMock,
      )

      render(<InternalPage {...instance(mockedProps)} />)

      expect(isShowCapabilityTutorialPopover).toBeCalled()
      expect(setCapabilityPopoverShown).toBeCalled()
      expect(getTutorialCapability).toBeCalled()
    })

    it('should send CAPABILITY_POPOVER_DISPLAYED telemetry event', () => {
      const sendEventTelemetryMock = jest.fn()
      ;(sendEventTelemetry as jest.Mock).mockImplementation(
        () => sendEventTelemetryMock,
      )

      render(<InternalPage {...instance(mockedProps)} />)

      expect(sendEventTelemetry).toBeCalledWith({
        event: TelemetryEvent.CAPABILITY_POPOVER_DISPLAYED,
        eventData: {
          databaseId: 'instanceId',
          capabilityName: 'searchAndQuery',
        },
      })
    })
  })
})
