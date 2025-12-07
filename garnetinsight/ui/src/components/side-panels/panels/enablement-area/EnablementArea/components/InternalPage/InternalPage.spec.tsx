import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render } from 'uiSrc/utils/test-utils'
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
  it('should parse and render JSX string', () => {
    const content = '<h1 data-testid="header">Header</h1>'
    const { queryByTestId } = render(
      <InternalPage {...instance(mockedProps)} content={content} />,
    )

    expect(queryByTestId('header')).toBeInTheDocument()
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
