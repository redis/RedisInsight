import React from 'react'
import { Environment } from 'apiClient'
import { cloneDeep } from 'lodash'
import reactRouterDom from 'react-router-dom'
import { AxiosError } from 'axios'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'
import {
  customTutorialsBulkUploadSelector,
  uploadDataBulk,
} from 'uiSrc/slices/workbench/wb-custom-tutorials'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { checkResourse } from 'uiSrc/services/resourcesService'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { useDatabaseEnvironment } from 'uiSrc/components/hooks/useDatabaseEnvironment'
import RedisUploadButton, { Props } from './RedisUploadButton'

const PRODUCTION_DISABLED_TOOLTIP =
  'Button disabled for your production database to avoid accidental data modifications.'

jest.mock('uiSrc/slices/workbench/wb-custom-tutorials', () => ({
  ...jest.requireActual('uiSrc/slices/workbench/wb-custom-tutorials'),
  customTutorialsBulkUploadSelector: jest.fn().mockReturnValue({
    pathsInProgress: [],
  }),
}))

jest.mock('uiSrc/services/resourcesService', () => ({
  ...jest.requireActual('uiSrc/services/resourcesService'),
  checkResourse: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/components/hooks/useDatabaseEnvironment', () => ({
  ...jest.requireActual('uiSrc/components/hooks/useDatabaseEnvironment'),
  useDatabaseEnvironment: jest.fn(),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
    environment: Environment.Unspecified,
    isDangerousCommand: () => false,
  })
})

const props: Props = {
  label: 'Label',
  path: '/text',
}

const error = {
  response: {
    data: {
      message: 'File not found. Check if this file exists and try again.',
    },
  },
} as AxiosError<any>

describe('RedisUploadButton', () => {
  beforeEach(() => {
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: 'instanceId' })
  })

  it('should render', () => {
    expect(render(<RedisUploadButton {...props} />)).toBeTruthy()
  })

  it('should be disabled with loading state', () => {
    ;(customTutorialsBulkUploadSelector as jest.Mock).mockReturnValueOnce({
      pathsInProgress: [props.path],
    })

    render(<RedisUploadButton {...props} />)

    expect(screen.getByTestId('upload-data-bulk-btn')).toBeDisabled()
  })

  it('should open warning popover and call proper actions after submit', () => {
    render(<RedisUploadButton {...props} />)

    fireEvent.click(screen.getByTestId('upload-data-bulk-btn'))

    expect(screen.getByTestId('upload-data-bulk-tooltip')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('upload-data-bulk-apply-btn'))

    const expectedActions = [uploadDataBulk(props.path)]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render no database poper', () => {
    reactRouterDom.useParams = jest
      .fn()
      .mockReturnValue({ instanceId: undefined })
    render(<RedisUploadButton {...props} />)

    fireEvent.click(screen.getByTestId('upload-data-bulk-btn'))

    expect(
      screen.getByTestId('database-not-opened-popover'),
    ).toBeInTheDocument()
  })

  it('should show error when file is not exists', async () => {
    const checkResourceMock = jest.fn().mockRejectedValue('')
    ;(checkResourse as jest.Mock).mockImplementation(checkResourceMock)

    render(<RedisUploadButton {...props} />)

    fireEvent.click(screen.getByTestId('upload-data-bulk-btn'))
    await act(async () => {
      fireEvent.click(screen.getByTestId('download-redis-upload-file'))
    })

    expect(checkResourceMock).toHaveBeenCalledWith('http://localhost:5001/text')
    const expected = addErrorNotification(error)
    expect(store.getActions()).toEqual(
      expect.arrayContaining([expect.objectContaining(expected)]),
    )
  })

  it('should call proper telemetry events', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(<RedisUploadButton {...props} />)

    fireEvent.click(screen.getByTestId('upload-data-bulk-btn'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.EXPLORE_PANEL_DATA_UPLOAD_CLICKED,
      eventData: {
        databaseId: 'instanceId',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()

    await act(async () => {
      fireEvent.click(screen.getByTestId('download-redis-upload-file'))
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.EXPLORE_PANEL_DOWNLOAD_BULK_FILE_CLICKED,
      eventData: {
        databaseId: 'instanceId',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()

    fireEvent.click(screen.getByTestId('upload-data-bulk-apply-btn'))

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.EXPLORE_PANEL_DATA_UPLOAD_SUBMITTED,
      eventData: {
        databaseId: 'instanceId',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  describe('production mode', () => {
    it('should disable the bulk-import button when mode is production', () => {
      ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
        environment: Environment.Production,
        isDangerousCommand: () => false,
      })

      render(<RedisUploadButton {...props} />)

      const btn = screen.getByTestId('upload-data-bulk-btn')
      expect(btn).toBeDisabled()
    })

    it('should not open popover or fire telemetry when clicked in production', () => {
      ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
        environment: Environment.Production,
        isDangerousCommand: () => false,
      })
      const sendEventTelemetryMock = jest.fn()
      ;(sendEventTelemetry as jest.Mock).mockImplementation(
        sendEventTelemetryMock,
      )

      render(<RedisUploadButton {...props} />)

      fireEvent.click(screen.getByTestId('upload-data-bulk-btn'))

      expect(
        screen.queryByTestId('upload-data-bulk-tooltip'),
      ).not.toBeInTheDocument()
      expect(sendEventTelemetryMock).not.toBeCalled()
    })

    it('should show the production tooltip copy on focus in production', async () => {
      ;(useDatabaseEnvironment as jest.Mock).mockReturnValue({
        environment: Environment.Production,
        isDangerousCommand: () => false,
      })

      render(<RedisUploadButton {...props} />)

      await act(async () => {
        fireEvent.focus(
          screen.getByTestId('upload-data-bulk-btn').parentElement!,
        )
      })
      await waitForRiTooltipVisible()

      expect(
        screen.getAllByText(PRODUCTION_DISABLED_TOOLTIP)[0],
      ).toBeInTheDocument()
    })
  })
})
