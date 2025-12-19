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
  mswServer.listen({
    onUnhandledRequest: 'bypass',
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
