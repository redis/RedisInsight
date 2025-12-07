import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'

import {
  fireEvent,
  render,
  cleanup,
  mockedStore,
  screen,
} from 'uiSrc/utils/test-utils'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'
import { rdiPipelineStrategiesSelector } from 'uiSrc/slices/rdi/pipeline'
import TemplateButton, { TemplateButtonProps } from './TemplateButton'

const mockedProps = mock<TemplateButtonProps>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineStrategiesSelector: jest.fn().mockReturnValue({
    loading: false,
    data: [
      {
        strategy: 'test',
      },
    ],
  }),
}))

describe('TemplateForm', () => {
  it('should render', () => {
    expect(render(<TemplateButton {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should be disabled if no templateOption', () => {
    ;(rdiPipelineStrategiesSelector as jest.Mock).mockImplementationOnce(
      () => ({
        loading: false,
        data: [],
      }),
    )

    render(<TemplateButton {...instance(mockedProps)} />)

    expect(screen.getByTestId('template-btn')).toBeDisabled()
  })

  it('should send telemetry on Click', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    render(<TemplateButton {...instance(mockedProps)} />)

    expect(screen.getByTestId('template-btn')).toBeEnabled()

    fireEvent.click(screen.getByTestId('template-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_TEMPLATE_CLICKED,
      eventData: {
        id: 'rdiInstanceId',
        page: RdiPipelineTabs.Jobs,
        mode: 'test',
      },
    })
  })
})
