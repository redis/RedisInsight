import { isMacOs } from 'uiSrc/utils'

describe('isMacOs', () => {
  const originalPlatform = navigator.platform
  afterAll(() => {
    Object.defineProperty(navigator, 'platform', {
      value: originalPlatform,
      writable: false,
    })
  })
  it('should return false for Linux', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Linux',
      writable: true,
    })
    expect(isMacOs()).toBeFalsy()
  })
  it('should return true for MacIntel', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      writable: true,
    })
    expect(isMacOs()).toBeTruthy()
  })
  it('should return true for MacPPC', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacPPC',
      writable: true,
    })
    expect(isMacOs()).toBeTruthy()
  })
  it('should return false for Windows', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Windows',
      writable: true,
    })
    expect(isMacOs()).toBeFalsy()
  })
})
