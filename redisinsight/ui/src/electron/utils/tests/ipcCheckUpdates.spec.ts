import { cloneDeep } from 'lodash'

import { cleanup, mockedStore } from 'uiSrc/utils/test-utils'
import { ipcCheckUpdates, ipcSendEvents } from '../ipcCheckUpdates'

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
})
describe('ipcSendEvents', () => {
  it('should call localStorageService.getAll if optimization needed', () => {
    const appVersionMock = '1'
    invokeMock.mockReturnValueOnce(true).mockReturnValue(false)

    ipcSendEvents({ appVersion: appVersionMock })

    expect(invokeMock).toBeCalled()
  })
})
