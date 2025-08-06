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

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserver,
})

beforeAll(() => {
  mswServer.listen()
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
