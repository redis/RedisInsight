import { cloneDeep } from 'lodash'

import { GetServerInfoResponse } from 'apiClient'
import { cleanup, mockedStore } from 'uiSrc/utils/test-utils'
import { whatsNewFeed } from 'uiSrc/utils'
import { openWhatsNew } from 'uiSrc/slices/app/whatsNew'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { TelemetryEvent } from 'uiSrc/telemetry'
import { AppUpdateStrategy } from 'uiSrc/electron/constants'
import { ipcCheckUpdates, ipcSendEvents } from '../ipcCheckUpdates'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

const { sendEventTelemetry } = jest.requireMock('uiSrc/telemetry')

const serverInfoMock = (appVersion: string): GetServerInfoResponse =>
  ({ appVersion }) as unknown as GetServerInfoResponse

const invokeMock = jest.fn()
let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  window.app = {
    ipc: { invoke: invokeMock },
  }
})

describe('ipcCheckUpdates', () => {
  it('should call localStorageService.getAll if optimization needed', () => {
    const appVersionMock = '1'
    invokeMock
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(appVersionMock)

    ipcCheckUpdates({ appVersion: appVersionMock }, () => {})

    expect(invokeMock).toBeCalled()
  })

  it('should open Whats New when the version is eligible', async () => {
    const version = whatsNewFeed[0].version
    invokeMock
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(version)

    await ipcCheckUpdates(serverInfoMock(version), store.dispatch)

    expect(store.getActions()).toContainEqual(openWhatsNew(version))
  })

  it('should fall back to the update toast for an ineligible version', async () => {
    const version = '0.0.1'
    invokeMock
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(version)

    await ipcCheckUpdates(serverInfoMock(version), store.dispatch)

    const actionTypes = store.getActions().map((action) => action.type)
    expect(actionTypes).not.toContain(openWhatsNew.type)
    expect(actionTypes).toContain(addMessageNotification.type)
  })

  it('should open Whats New even when the version cards are flag-gated off', async () => {
    // 3.2.0's only card is gated behind azureEntraId (off here) — it renders
    // as "coming soon" instead of blocking the auto-open
    const version = '3.2.0'
    invokeMock
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(version)

    await ipcCheckUpdates(serverInfoMock(version), store.dispatch)

    expect(store.getActions()).toContainEqual(openWhatsNew(version))
  })
})
describe('ipcSendEvents', () => {
  it('should call localStorageService.getAll if optimization needed', () => {
    const appVersionMock = '1'
    invokeMock.mockReturnValueOnce(true).mockReturnValue(false)

    ipcSendEvents({ appVersion: appVersionMock })

    expect(invokeMock).toBeCalled()
  })

  it('should default the strategy to auto for a legacy download with no stored strategy', async () => {
    invokeMock
      .mockReturnValueOnce(true) // isUpdateDownloadedForTelemetry
      .mockReturnValueOnce(false) // isUpdateAvailable
      .mockReturnValueOnce('2.0.0') // newVer
      .mockReturnValueOnce('1.0.0') // prevVer
      .mockReturnValueOnce(undefined) // updateDownloadedStrategy - never written by a pre-feature build

    await ipcSendEvents(serverInfoMock('2.0.0'))

    expect(sendEventTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({
        event: TelemetryEvent.APPLICATION_UPDATED,
        eventData: expect.objectContaining({
          strategy: AppUpdateStrategy.auto,
        }),
      }),
    )
  })
})
