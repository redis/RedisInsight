import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  mockedStore,
  render,
  screen,
  fireEvent,
} from 'uiSrc/utils/test-utils'
import { AppUpdateStatus } from 'uiSrc/electron/constants'
import { TelemetryEvent } from 'uiSrc/telemetry'
import {
  addInfiniteNotification,
  addMessageNotification,
  removeInfiniteNotification,
} from 'uiSrc/slices/app/notifications'
import { InfiniteMessagesIds } from 'uiSrc/components/notifications/components'
import { IMessage, InfiniteMessage } from 'uiSrc/slices/interfaces'

import ConfigElectron from './ConfigElectron'

const findInfiniteNotification = (store: typeof mockedStore) =>
  store
    .getActions()
    .find((action) => action.type === addInfiniteNotification.type) as
    | { payload: InfiniteMessage }
    | undefined

const findMessageNotification = (store: typeof mockedStore) =>
  store
    .getActions()
    .find((action) => action.type === addMessageNotification.type) as
    | { payload: IMessage }
    | undefined

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/electron/utils', () => ({
  ...jest.requireActual('uiSrc/electron/utils'),
  ipcCheckUpdates: jest.fn(),
  ipcSendEvents: jest.fn(),
  ipcAppUpdateDownload: jest.fn(),
  ipcSkipUpdateVersion: jest.fn(),
}))

const { sendEventTelemetry } = require('uiSrc/telemetry')
const {
  ipcAppUpdateDownload,
  ipcSkipUpdateVersion,
} = require('uiSrc/electron/utils')

let store: typeof mockedStore

describe('ConfigElectron', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
    store = cloneDeep(mockedStore)
    store.clearActions()
    window.app = {
      ...window.app,
      updateState: jest.fn(),
    }
  })

  it('should render', () => {
    expect(render(<ConfigElectron />)).toBeTruthy()
  })

  it('should register an update-state listener on mount', () => {
    render(<ConfigElectron />, { store })

    expect(window.app.updateState).toHaveBeenCalledWith(expect.any(Function))
  })

  describe('update-state listener', () => {
    const triggerUpdateState = (payload: {
      status: AppUpdateStatus
      version?: string
    }) => {
      render(<ConfigElectron />, { store })
      const updateStateAction = (window.app.updateState as jest.Mock).mock
        .calls[0][0]
      updateStateAction(null, payload)
    }

    it('should show the update-found notification and start the download on "Update"', () => {
      triggerUpdateState({
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })

      const addAction = findInfiniteNotification(store)
      expect(addAction?.payload.id).toBe(InfiniteMessagesIds.appUpdateFound)

      render(addAction?.payload.description as React.ReactElement)
      fireEvent.click(screen.getByRole('button', { name: /Update/ }))

      expect(ipcAppUpdateDownload).toHaveBeenCalled()
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.UPDATE_NOTIFICATION_DOWNLOAD_CLICKED,
      })

      const addActions = store
        .getActions()
        .filter(
          (action) => action.type === addInfiniteNotification.type,
        ) as unknown as { payload: InfiniteMessage }[]
      const downloadingAction = addActions[addActions.length - 1]
      expect(downloadingAction.payload.id).toBe(
        InfiniteMessagesIds.appUpdateFound,
      )
    })

    it('should skip the version when clicking "Skip this version"', () => {
      triggerUpdateState({
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })

      const addAction = findInfiniteNotification(store)

      render(addAction?.payload.description as React.ReactElement)
      fireEvent.click(screen.getByRole('button', { name: /Skip this version/ }))

      expect(ipcSkipUpdateVersion).toHaveBeenCalledWith('1.2.3')
      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.UPDATE_NOTIFICATION_SKIPPED,
      })
      expect(store.getActions()).toContainEqual(
        removeInfiniteNotification(InfiniteMessagesIds.appUpdateFound),
      )
    })

    it('should clear the toast and show an error notification on failure', () => {
      triggerUpdateState({ status: AppUpdateStatus.Error })

      expect(store.getActions()).toContainEqual(
        removeInfiniteNotification(InfiniteMessagesIds.appUpdateFound),
      )
      const messageAction = findMessageNotification(store)
      expect(messageAction?.payload.variant).toBe('danger')
    })
  })
})
