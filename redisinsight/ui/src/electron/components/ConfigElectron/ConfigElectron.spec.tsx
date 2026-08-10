import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  mockedStore,
  render,
  screen,
  fireEvent,
} from 'uiSrc/utils/test-utils'
import { AppUpdateStatus, AppUpdateStrategy } from 'uiSrc/electron/constants'
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
      updateAvailable: jest.fn(),
    }
  })

  it('should render', () => {
    expect(render(<ConfigElectron />)).toBeTruthy()
  })

  it('should register an update-state listener on mount', () => {
    render(<ConfigElectron />, { store })

    expect(window.app.updateState).toHaveBeenCalledWith(expect.any(Function))
  })

  describe('update-available listener', () => {
    it('should dispatch the restart notification synchronously, not gated behind the strategy IPC call', () => {
      render(<ConfigElectron />, { store })
      const updateAvailableAction = (window.app.updateAvailable as jest.Mock)
        .mock.calls[0][0]

      updateAvailableAction(null, { version: '1.2.3' })

      expect(store.getActions()).toContainEqual(
        removeInfiniteNotification(InfiniteMessagesIds.appUpdateFound),
      )
      const addAction = findInfiniteNotification(store)
      expect(addAction?.payload.id).toBe(InfiniteMessagesIds.appUpdateAvailable)
    })

    it('should remove the restart notification from the store when dismissed with X', () => {
      render(<ConfigElectron />, { store })
      const updateAvailableAction = (window.app.updateAvailable as jest.Mock)
        .mock.calls[0][0]

      updateAvailableAction(null, { version: '1.2.3' })
      const addAction = findInfiniteNotification(store)
      addAction?.payload.onClose?.()

      expect(store.getActions()).toContainEqual(
        removeInfiniteNotification(InfiniteMessagesIds.appUpdateAvailable),
      )
    })

    it('should not resurface a dismissed restart version on the next periodic completion', () => {
      render(<ConfigElectron />, { store })
      const updateAvailableAction = (window.app.updateAvailable as jest.Mock)
        .mock.calls[0][0]

      updateAvailableAction(null, { version: '1.2.3' })
      const addAction = findInfiniteNotification(store)
      addAction?.payload.onClose?.()

      store.clearActions()

      // Main resends appUpdateAvailable for the same version on a later
      // periodic check that still finds it already downloaded.
      updateAvailableAction(null, { version: '1.2.3' })

      expect(store.getActions()).toHaveLength(0)

      // A genuinely newer version is still announced.
      updateAvailableAction(null, { version: '1.2.4' })

      const newAddAction = findInfiniteNotification(store)
      expect(newAddAction?.payload.variation).toBe('1.2.4')
    })
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

    it('should clear a pending restart-to-install toast when a newer update is found', () => {
      triggerUpdateState({
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })

      expect(store.getActions()).toContainEqual(
        removeInfiniteNotification(InfiniteMessagesIds.appUpdateAvailable),
      )
    })

    it('should leave a still-open found toast alone when the same version resends', () => {
      render(<ConfigElectron />, { store })
      const updateStateAction = (window.app.updateState as jest.Mock).mock
        .calls[0][0]

      updateStateAction(null, {
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })
      const foundAction = findInfiniteNotification(store)
      store.clearActions()
      jest.clearAllMocks()

      // Main resends the same still-pending version on the next periodic
      // check; the open, unactioned toast must not be re-created.
      updateStateAction(null, {
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })

      expect(store.getActions()).toHaveLength(0)

      render(foundAction?.payload.description as React.ReactElement)
      fireEvent.click(screen.getByRole('button', { name: /Update/ }))

      expect(ipcAppUpdateDownload).toHaveBeenCalled()
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

    it('should ignore "Skip this version" if "Update" was already clicked', () => {
      triggerUpdateState({
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })

      const addAction = findInfiniteNotification(store)
      render(addAction?.payload.description as React.ReactElement)

      fireEvent.click(screen.getByRole('button', { name: /Update/ }))
      fireEvent.click(screen.getByRole('button', { name: /Skip this version/ }))

      expect(ipcSkipUpdateVersion).not.toHaveBeenCalled()
    })

    it('should emit close telemetry only when dismissed without choosing an action', () => {
      triggerUpdateState({
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })

      const addAction = findInfiniteNotification(store)
      addAction?.payload.onClose?.()

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.UPDATE_NOTIFICATION_CLOSED,
      })
    })

    it('should remove the found notification when dismissed with X', () => {
      triggerUpdateState({
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })

      const addAction = findInfiniteNotification(store)
      addAction?.payload.onClose?.()

      expect(store.getActions()).toContainEqual(
        removeInfiniteNotification(InfiniteMessagesIds.appUpdateFound),
      )
    })

    it('should not resurface a dismissed version on the next periodic check, but should announce a newer one', () => {
      render(<ConfigElectron />, { store })
      const updateStateAction = (window.app.updateState as jest.Mock).mock
        .calls[0][0]

      updateStateAction(null, {
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })
      const foundAction = findInfiniteNotification(store)
      foundAction?.payload.onClose?.()

      store.clearActions()
      jest.clearAllMocks()

      // Main resends 'available' for the same version on the next
      // periodic check - it must stay hidden until the next app launch.
      updateStateAction(null, {
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })

      expect(store.getActions()).toHaveLength(0)

      // A genuinely newer version is still announced.
      updateStateAction(null, {
        status: AppUpdateStatus.Available,
        version: '1.2.4',
      })

      const addAction = findInfiniteNotification(store)
      expect(addAction?.payload.id).toBe(InfiniteMessagesIds.appUpdateFound)
    })

    it('should not emit close telemetry after "Update" was clicked', () => {
      triggerUpdateState({
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })

      const addAction = findInfiniteNotification(store)
      render(addAction?.payload.description as React.ReactElement)
      fireEvent.click(screen.getByRole('button', { name: /Update/ }))
      jest.clearAllMocks()

      addAction?.payload.onClose?.()

      expect(sendEventTelemetry).not.toHaveBeenCalledWith({
        event: TelemetryEvent.UPDATE_NOTIFICATION_CLOSED,
      })
    })

    it('should clear the toast and show an error notification on failure', () => {
      triggerUpdateState({ status: AppUpdateStatus.Error })

      expect(store.getActions()).toContainEqual(
        removeInfiniteNotification(InfiniteMessagesIds.appUpdateFound),
      )
      const messageAction = findMessageNotification(store)
      expect(messageAction?.payload.variant).toBe('danger')
    })

    it('should restore a working retry prompt after a download failure', () => {
      render(<ConfigElectron />, { store })
      const updateStateAction = (window.app.updateState as jest.Mock).mock
        .calls[0][0]

      updateStateAction(null, {
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })
      store.clearActions()
      jest.clearAllMocks()

      updateStateAction(null, { status: AppUpdateStatus.Error })

      expect(sendEventTelemetry).toHaveBeenCalledWith({
        event: TelemetryEvent.UPDATE_NOTIFICATION_DISPLAYED,
        eventData: { strategy: AppUpdateStrategy.notify },
      })

      const addActions = store
        .getActions()
        .filter(
          (action) => action.type === addInfiniteNotification.type,
        ) as unknown as { payload: InfiniteMessage }[]
      const retryAction = addActions[addActions.length - 1]
      expect(retryAction.payload.id).toBe(InfiniteMessagesIds.appUpdateFound)

      render(retryAction.payload.description as React.ReactElement)
      fireEvent.click(screen.getByRole('button', { name: /Update/ }))

      expect(ipcAppUpdateDownload).toHaveBeenCalled()
    })

    it('should not let a stale found-toast close resolve its replacement', () => {
      render(<ConfigElectron />, { store })
      const updateStateAction = (window.app.updateState as jest.Mock).mock
        .calls[0][0]

      updateStateAction(null, {
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })
      const foundAction = findInfiniteNotification(store)

      // User clicks Update; the throttled notification queue hasn't
      // visually replaced the found toast with the downloading one yet.
      render(foundAction?.payload.description as React.ReactElement)
      fireEvent.click(screen.getByRole('button', { name: /Update/ }))

      store.clearActions()
      jest.clearAllMocks()

      // The download fails immediately, before the queue swaps the toast.
      updateStateAction(null, { status: AppUpdateStatus.Error })

      // The queue later dismisses the stale, still-mounted original toast;
      // its onClose must not act on the retry prompt that replaced it.
      foundAction?.payload.onClose?.()

      // The retry prompt (added by the Error branch) must be the last
      // thing to happen to appUpdateFound - not removed by the stale close.
      const relevantActions = store
        .getActions()
        .filter(
          (action) =>
            (action.type === removeInfiniteNotification.type &&
              action.payload === InfiniteMessagesIds.appUpdateFound) ||
            (action.type === addInfiniteNotification.type &&
              (action.payload as InfiniteMessage).id ===
                InfiniteMessagesIds.appUpdateFound),
        )
      expect(relevantActions[relevantActions.length - 1].type).toBe(
        addInfiniteNotification.type,
      )
      expect(sendEventTelemetry).not.toHaveBeenCalledWith({
        event: TelemetryEvent.UPDATE_NOTIFICATION_CLOSED,
      })

      const addActions = store
        .getActions()
        .filter(
          (action) => action.type === addInfiniteNotification.type,
        ) as unknown as { payload: InfiniteMessage }[]
      const retryAction = addActions[addActions.length - 1]
      cleanup()
      render(retryAction.payload.description as React.ReactElement)
      fireEvent.click(screen.getByRole('button', { name: /Update/ }))

      expect(ipcAppUpdateDownload).toHaveBeenCalled()
    })

    it('should not let a stale found-toast close remove a newer version that replaced it', () => {
      render(<ConfigElectron />, { store })
      const updateStateAction = (window.app.updateState as jest.Mock).mock
        .calls[0][0]

      updateStateAction(null, {
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })
      const foundAction = findInfiniteNotification(store)

      // A newer version is found before the user acts on the current toast.
      updateStateAction(null, {
        status: AppUpdateStatus.Available,
        version: '1.2.4',
      })

      // The queue later dismisses the stale, still-mounted original toast;
      // its onClose must not act on the newer prompt that replaced it.
      foundAction?.payload.onClose?.()

      const relevantActions = store
        .getActions()
        .filter(
          (action) =>
            (action.type === removeInfiniteNotification.type &&
              action.payload === InfiniteMessagesIds.appUpdateFound) ||
            (action.type === addInfiniteNotification.type &&
              (action.payload as InfiniteMessage).id ===
                InfiniteMessagesIds.appUpdateFound),
        )
      expect(relevantActions[relevantActions.length - 1].type).toBe(
        addInfiniteNotification.type,
      )

      const addActions = store
        .getActions()
        .filter(
          (action) => action.type === addInfiniteNotification.type,
        ) as unknown as { payload: InfiniteMessage }[]
      const latestFoundAction = addActions[addActions.length - 1]
      expect(latestFoundAction.payload.variation).toBe('1.2.4')
      cleanup()
      render(latestFoundAction.payload.description as React.ReactElement)
      fireEvent.click(screen.getByRole('button', { name: /Update/ }))

      expect(ipcAppUpdateDownload).toHaveBeenCalledWith('1.2.4')
    })

    it('should restore a retry prompt even if the available version was falsy', () => {
      render(<ConfigElectron />, { store })
      const updateStateAction = (window.app.updateState as jest.Mock).mock
        .calls[0][0]

      updateStateAction(null, { status: AppUpdateStatus.Available })
      store.clearActions()

      updateStateAction(null, { status: AppUpdateStatus.Error })

      const addActions = store
        .getActions()
        .filter(
          (action) => action.type === addInfiniteNotification.type,
        ) as unknown as { payload: InfiniteMessage }[]
      expect(addActions[addActions.length - 1]?.payload.id).toBe(
        InfiniteMessagesIds.appUpdateFound,
      )
    })

    it('should not emit close telemetry when a completed download replaces the open prompt', () => {
      render(<ConfigElectron />, { store })
      const updateStateAction = (window.app.updateState as jest.Mock).mock
        .calls[0][0]
      const updateAvailableAction = (window.app.updateAvailable as jest.Mock)
        .mock.calls[0][0]

      updateStateAction(null, {
        status: AppUpdateStatus.Available,
        version: '1.2.3',
      })
      const foundAction = findInfiniteNotification(store)
      jest.clearAllMocks()

      // The user switched strategy while the prompt was open; the resulting
      // download completes and replaces it programmatically.
      updateAvailableAction(null, { version: '1.2.3' })
      foundAction?.payload.onClose?.()

      expect(sendEventTelemetry).not.toHaveBeenCalledWith({
        event: TelemetryEvent.UPDATE_NOTIFICATION_CLOSED,
      })
    })
  })
})
