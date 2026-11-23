/// <reference types="jest" />
import { shell } from 'electron'
import log from 'electron-log'
import { initWindowHandlers } from './window.handlers'

jest.mock('electron', () => ({
  BrowserWindow: jest.fn(),
  app: {},
  ipcMain: { handle: jest.fn() },
  shell: { openExternal: jest.fn() },
}))

jest.mock('electron-log', () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn() },
}))

jest.mock(
  'desktopSrc/lib',
  () => ({
    MenuBuilder: jest.fn(),
    getDisplayAppInTrayValue: jest.fn(),
    getIsQuiting: jest.fn(),
    getTray: jest.fn(),
    getTrayInstance: jest.fn(),
    electronStore: undefined,
    windowFactory: jest.fn(),
    WindowType: {},
    quitAndInstallUpdate: jest.fn(),
  }),
  { virtual: true },
)

const NO_APP_ERROR = 'No application found to open URL'
const URL_TO_OPEN = 'unknown-scheme://example'

const flushPromises = () => new Promise((resolve) => setImmediate(resolve))

describe('initWindowHandlers - external links', () => {
  const openExternal = shell.openExternal as jest.Mock

  const setup = () => {
    const webContents = {
      on: jest.fn(),
      setWindowOpenHandler: jest.fn(),
    }
    const win = { webContents, on: jest.fn() }
    initWindowHandlers(win as any, null, new Map(), 'id')
    return webContents
  }

  beforeEach(() => {
    openExternal.mockRejectedValue(new Error(NO_APP_ERROR))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should deny the window and swallow an openExternal rejection', async () => {
    const webContents = setup()
    const handler = webContents.setWindowOpenHandler.mock.calls[0][0]

    expect(handler({ url: URL_TO_OPEN })).toEqual({ action: 'deny' })
    await flushPromises()

    expect(openExternal).toHaveBeenCalledWith(URL_TO_OPEN)
    expect(log.error).toHaveBeenCalled()
  })

  it('should swallow an openExternal rejection from the new-window handler', async () => {
    const webContents = setup()
    const [, handler] = webContents.on.mock.calls.find(
      ([event]) => event === 'new-window',
    )!
    const event = { preventDefault: jest.fn() }

    handler(event, URL_TO_OPEN)
    await flushPromises()

    expect(event.preventDefault).toHaveBeenCalled()
    expect(openExternal).toHaveBeenCalledWith(URL_TO_OPEN)
    expect(log.error).toHaveBeenCalled()
  })
})
