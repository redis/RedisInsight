import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  expectActionsToContain,
  mockedStore,
  render,
  screen,
  userEvent,
} from 'uiSrc/utils/test-utils'
import { getPipeline, rdiPipelineSelector } from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import DownloadFromServerModal from './DownloadFromServerModal'
import { Button } from 'uiSrc/components/base/forms/buttons'

jest.mock('uiSrc/slices/rdi/pipeline', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/pipeline'),
  rdiPipelineSelector: jest.fn().mockReturnValue({
    loading: false,
    data: {
      jobs: [{ name: 'job1', value: 'value' }],
    },
  }),
}))

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn().mockReturnValue({
    values: {
      config: 'value',
      jobs: [
        { name: 'job1', value: 'value' },
        { name: 'job2', value: 'value' },
      ],
    },
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const trigger = <Button data-testid="trigger-btn">trigger</Button>
const renderDownloadFromServerModal = () =>
  render(<DownloadFromServerModal trigger={trigger} />)

describe('FetchPipelinePopover', () => {
  it('should render', () => {
    expect(renderDownloadFromServerModal()).toBeTruthy()
  })

  it('should open confirmation message', async () => {
    renderDownloadFromServerModal()

    expect(screen.queryByTestId('upload-confirm-btn')).not.toBeInTheDocument()

    await userEvent.click(screen.getByTestId('trigger-btn'))

    expect(screen.queryByTestId('upload-confirm-btn')).toBeInTheDocument()
  })

  it('should call proper actions', async () => {
    renderDownloadFromServerModal()

    await userEvent.click(screen.getByTestId('trigger-btn'))

    await userEvent.click(screen.getByTestId('upload-confirm-btn'))

    const expectedActions = [getPipeline()]
    expectActionsToContain(store.getActions(), expectedActions)
  })

  it('should call proper telemetry event', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )

    renderDownloadFromServerModal()

    await userEvent.click(screen.getByTestId('trigger-btn'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_FROM_SERVER_CLICKED,
      eventData: {
        id: 'rdiInstanceId',
        jobsNumber: 1,
      },
    })
  })

  it('should render disabled trigger btn', () => {
    ;(rdiPipelineSelector as jest.Mock).mockImplementation(() => ({
      loading: true,
    }))

    renderDownloadFromServerModal()

    expect(screen.getByTestId('trigger-btn')).toBeDisabled()
  })
})
