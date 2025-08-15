import React from 'react'
import { instance, mock } from 'ts-mockito'
import { MONACO_MANUAL } from 'uiSrc/constants'
import {
  defaultValue,
  EnablementAreaProvider,
} from 'uiSrc/pages/workbench/contexts/enablementAreaContext'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import Code, { Props } from './Code'

const mockedProps = mock<Props>()
const label = 'btn'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    provider: 'REDIS_CLOUD',
  }),
}))

describe('Code', () => {
  it('should render', () => {
    const component = render(
      <Code {...instance(mockedProps)} label={label}>
        {MONACO_MANUAL}
      </Code>,
    )
    const { container } = component

    expect(component).toBeTruthy()
    expect(container).toHaveTextContent(label)
  })
  it('should correctly set script', () => {
    const setScript = jest.fn()

    const { queryByTestId } = render(
      <EnablementAreaProvider value={{ ...defaultValue, setScript }}>
        <Code {...instance(mockedProps)} label={label}>
          {MONACO_MANUAL}
        </Code>
      </EnablementAreaProvider>,
    )

    const link = queryByTestId(`run-btn-${label}`)
    fireEvent.click(link as Element)
    expect(setScript).toBeCalledWith(
      MONACO_MANUAL,
      undefined,
      expect.any(Function),
    )
  })

  it('should correctly set script with auto execute', () => {
    const setScript = jest.fn()

    render(
      <EnablementAreaProvider value={{ ...defaultValue, setScript }}>
        <Code {...instance(mockedProps)} label={label} params="[auto=true]">
          {MONACO_MANUAL}
        </Code>
      </EnablementAreaProvider>,
    )

    fireEvent.click(screen.queryByTestId(`run-btn-${label}`) as Element)
    expect(setScript).toBeCalledWith(
      MONACO_MANUAL,
      { auto: 'true' },
      expect.any(Function),
    )
  })

  it('should call proper telemetry on Copy', () => {
    const setScript = jest.fn()
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(
      <EnablementAreaProvider value={{ ...defaultValue, setScript }}>
        <Code
          {...instance(mockedProps)}
          label={label}
          path="path"
          params="[auto=true]"
        >
          {MONACO_MANUAL}
        </Code>
      </EnablementAreaProvider>,
    )

    fireEvent.click(screen.queryByTestId(`copy-btn-${label}`) as Element)
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.EXPLORE_PANEL_COMMAND_COPIED,
      eventData: {
        buttonName: label,
        databaseId: 'instanceId',
        path: 'path',
        provider: 'REDIS_CLOUD',
      },
    })
  })

  it('should call proper telemetry on apply', () => {
    const setScript = jest.fn()
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(
      <EnablementAreaProvider value={{ ...defaultValue, setScript }}>
        <Code {...instance(mockedProps)} label={label} path="path" params="">
          {MONACO_MANUAL}
        </Code>
      </EnablementAreaProvider>,
    )

    fireEvent.click(screen.queryByTestId(`run-btn-${label}`) as Element)
    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.EXPLORE_PANEL_COMMAND_RUN_CLICKED,
      eventData: {
        databaseId: 'instanceId',
        path: 'path',
        provider: 'REDIS_CLOUD',
      },
    })
  })
})
