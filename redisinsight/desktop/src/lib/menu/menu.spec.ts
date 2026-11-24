/// <reference types="jest" />
import { BrowserWindow, MenuItemConstructorOptions } from 'electron'
import { MenuBuilder } from './menu'

jest.mock(
  'desktopSrc/lib',
  () => ({
    getDisplayAppInTrayValue: jest.fn(),
    updateDisplayAppInTray: jest.fn(),
    WindowType: { Main: 'main' },
    windowFactory: jest.fn(),
    electronStore: { set: jest.fn() },
    shouldShowManualUpdateCheck: jest.fn(),
    triggerManualUpdateCheck: jest.fn(),
  }),
  { virtual: true },
)

jest.mock('electron', () => ({
  app: { name: 'RedisInsight' },
  shell: { openExternal: jest.fn() },
  Menu: {
    buildFromTemplate: jest.fn((template) => template),
    setApplicationMenu: jest.fn(),
  },
}))

const DESTROYED_MESSAGE = 'Object has been destroyed'

const createWindow = () =>
  ({
    isDestroyed: jest.fn(() => false),
    close: jest.fn(),
  }) as unknown as BrowserWindow

const findItem = (
  template: MenuItemConstructorOptions[],
  label: string,
): MenuItemConstructorOptions | undefined =>
  template
    .flatMap((item) => (Array.isArray(item.submenu) ? item.submenu : []))
    .find((item) => item.label === label)

const buildCloseItem = (platform: NodeJS.Platform, label: string) => {
  const originalPlatform = process.platform
  Object.defineProperty(process, 'platform', { value: platform })
  try {
    const mainWindow = createWindow()
    const template = new MenuBuilder(mainWindow).buildMenu()
    return {
      item: findItem(
        template as unknown as MenuItemConstructorOptions[],
        label,
      ),
      mainWindow,
    }
  } finally {
    Object.defineProperty(process, 'platform', { value: originalPlatform })
  }
}

describe('MenuBuilder Close item', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each([
    ['darwin', 'Close'],
    ['win32', '&Close'],
  ] as const)('should close a live window on %s', (platform, label) => {
    const { item, mainWindow } = buildCloseItem(platform, label)

    ;(item?.click as () => void)()

    expect(mainWindow.close).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['darwin', 'Close'],
    ['win32', '&Close'],
  ] as const)(
    'should not throw when the window is already destroyed on %s',
    (platform, label) => {
      const { item, mainWindow } = buildCloseItem(platform, label)
      ;(mainWindow.isDestroyed as jest.Mock).mockReturnValue(true)
      ;(mainWindow.close as jest.Mock).mockImplementation(() => {
        throw new TypeError(DESTROYED_MESSAGE)
      })

      expect(() => (item?.click as () => void)()).not.toThrow()
      expect(mainWindow.close).not.toHaveBeenCalled()
    },
  )
})
