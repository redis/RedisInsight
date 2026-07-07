import { cloneDeep } from 'lodash'

import { GetServerInfoResponse } from 'apiClient'
import { cleanup, mockedStore } from 'uiSrc/utils/test-utils'
import { openWhatsNew, whatsNewFeed } from 'uiSrc/slices/app/whatsNew'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import { ipcCheckUpdates, ipcSendEvents } from '../ipcCheckUpdates'

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

  it('should open Whats New when enabled and the version is eligible', async () => {
    const version = whatsNewFeed[0].version
    invokeMock
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(version)

    await ipcCheckUpdates(serverInfoMock(version), store.dispatch, true)

    expect(store.getActions()).toContainEqual(openWhatsNew(version))
  })

  it('should not open Whats New for an ineligible version even when enabled', async () => {
    const version = '0.0.1'
    invokeMock
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(version)

    await ipcCheckUpdates(serverInfoMock(version), store.dispatch, true)

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

    await ipcCheckUpdates(serverInfoMock(version), store.dispatch, false)

    const actionTypes = store.getActions().map((action) => action.type)
    expect(actionTypes).not.toContain(openWhatsNew.type)
    expect(actionTypes).toContain(addMessageNotification.type)
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
