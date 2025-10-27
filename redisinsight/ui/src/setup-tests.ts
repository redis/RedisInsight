import '@testing-library/jest-dom'
import 'whatwg-fetch'

import { mswServer } from 'uiSrc/mocks/server'

export const URL = 'URL'
window.URL.revokeObjectURL = () => {}
window.URL.createObjectURL = () => URL

class ResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

class File extends Blob {
  constructor(fileBits: any[], fileName: string, options?: any) {
    super(fileBits, options)
    this.name = fileName
  }

  lastModified = Date.now()

  name = 'test-file'

  webkitRelativePath = ''
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserver,
})

Object.defineProperty(window, 'File', {
  writable: true,
  configurable: true,
  value: File,
})

beforeAll(() => {
  // mswServer.listen()
  mswServer.listen({
    onUnhandledRequest: ((req: any, res: any, ctx: any) => {
      const url = req.url.href
      const method = req.method
      const testName = expect.getState()?.currentTestName ?? 'unknown test'

      // Log it nicely
      console.warn(`[MSW][${testName}] Unhandled request: ${method} ${url}`)

      // throw to fail the test???
      // tmp: just return empty object to fix libuv error.
      // todo: need to find all unhandled requests and probably throw right from here and close socket
      return res(
        ctx.status(200),
        ctx.json({})
      )
    }) as any,
  })
})

afterEach(() => {
  mswServer.resetHandlers()
})

afterAll(() => {
  // server.printHandlers()
  mswServer.close()
})

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// we need this since jsdom doesn't support PointerEvent
window.HTMLElement.prototype.hasPointerCapture = jest.fn()

// Mock window.indexedDB for test environments (jsdom/Node)
if (!window.indexedDB) {
  window.indexedDB = {
    open: jest.fn(() => ({
      onerror: jest.fn(),
      onsuccess: jest.fn(),
      onupgradeneeded: jest.fn(),
      result: {},
    })),
  } as any
}
