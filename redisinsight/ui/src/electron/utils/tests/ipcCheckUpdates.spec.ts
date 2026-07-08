import { cloneDeep } from 'lodash'

import { GetServerInfoResponse } from 'apiClient'
import { cleanup, mockedStore } from 'uiSrc/utils/test-utils'
import { FeatureFlagsMap, whatsNewFeed } from 'uiSrc/utils'
import { openWhatsNew } from 'uiSrc/slices/app/whatsNew'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { FeatureFlags } from 'uiSrc/constants'
import { ipcCheckUpdates, ipcSendEvents } from '../ipcCheckUpdates'

const serverInfoMock = (appVersion: string): GetServerInfoResponse =>
  ({ appVersion }) as unknown as GetServerInfoResponse

const whatsNewOnFeatures: FeatureFlagsMap = {
  [FeatureFlags.whatsNew]: { flag: true },
}

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

  it('should open Whats New when enabled and the version is eligible', async () => {
    const version = whatsNewFeed[0].version
    invokeMock
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(version)

    await ipcCheckUpdates(
      serverInfoMock(version),
      store.dispatch,
      whatsNewOnFeatures,
    )

    expect(store.getActions()).toContainEqual(openWhatsNew(version))
  })

  it('should not open Whats New for an ineligible version even when enabled', async () => {
    const version = '0.0.1'
    invokeMock
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(version)

    await ipcCheckUpdates(
      serverInfoMock(version),
      store.dispatch,
      whatsNewOnFeatures,
    )

    const actionTypes = store.getActions().map((action) => action.type)
    expect(actionTypes).not.toContain(openWhatsNew.type)
    expect(actionTypes).toContain(addMessageNotification.type)
  })

  it('should fall back to the update toast when Whats New is disabled', async () => {
    const version = whatsNewFeed[0].version
    invokeMock
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(version)

    await ipcCheckUpdates(serverInfoMock(version), store.dispatch, {})

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

    await ipcCheckUpdates(
      serverInfoMock(version),
      store.dispatch,
      whatsNewOnFeatures,
    )

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
})
