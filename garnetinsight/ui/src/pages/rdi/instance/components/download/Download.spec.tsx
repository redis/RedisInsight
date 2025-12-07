import React from 'react'

import { rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { render, screen, userEvent } from 'uiSrc/utils/test-utils'
import Download, { Props } from './Download'

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    config: 'value',
    jobs: [
      { name: 'job1', value: 'value' },
      { name: 'job2', value: 'value' },
    ],
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const button = (
  <button type="button" data-testid="download-pipeline-btn">
    test
  </button>
)

const renderDownload = (props: Partial<Props> = {}) => {
  const { trigger = button, ...rest } = props
  return render(<Download trigger={trigger} {...rest} />)
}

describe('Download', () => {
  it('should render', () => {
    expect(renderDownload()).toBeTruthy()
  })

  it('should call onClose when download clicked', async () => {
    const onClose = jest.fn()
    renderDownload({ onClose })

    await userEvent.click(screen.getByTestId('download-pipeline-btn'))

    expect(onClose).toBeCalledTimes(1)
  })

  it('should call proper telemetry event when button is clicked', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    renderDownload()

    await userEvent.click(screen.getByTestId('download-pipeline-btn'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_DOWNLOAD_CLICKED,
      eventData: {
        id: 'rdiInstanceId',
        jobsNumber: 2,
      },
    })
  })

  it('should render disabled download button when loading', () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementation(() => ({
      loading: true,
    }))

    renderDownload()

    expect(screen.getByTestId('download-pipeline-btn')).toBeDisabled()
  })
})
