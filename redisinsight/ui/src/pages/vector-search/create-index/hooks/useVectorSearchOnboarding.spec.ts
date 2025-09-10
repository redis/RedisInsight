import { renderHook, act } from '@testing-library/react-hooks'
import { BrowserStorageItem } from 'uiSrc/constants'
import useVectorSearchOnboarding from './useVectorSearchOnboarding'

describe('useVectorSearchOnboarding', () => {
  let store: any = {}

  beforeEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()

    jest
      .spyOn(window.localStorage, 'getItem')
      .mockImplementation((key) => (key in store ? store[key] : null))

    jest
      .spyOn(window.localStorage, 'setItem')
      .mockImplementation((key, value) => {
        store[key] = value.toString()
      })
  })

  it('should return showOnboarding=true if localStorage is not set', () => {
    const { result } = renderHook(() => useVectorSearchOnboarding())

    expect(result.current.showOnboarding).toBe(true)
  })

  it('should return showOnboarding=false if localStorage is set to "true"', () => {
    localStorage.setItem(BrowserStorageItem.vectorSearchOnboarding, 'true')

    const { result } = renderHook(() => useVectorSearchOnboarding())

    expect(result.current.showOnboarding).toBe(false)
  })

  it('should set localStorage and update showOnboarding when markOnboardingAsSeen is called', () => {
    const { result } = renderHook(() => useVectorSearchOnboarding())

    act(() => {
      result.current.markOnboardingAsSeen()
    })

    expect(result.current.showOnboarding).toBe(false)
    expect(
      localStorage.getItem(BrowserStorageItem.vectorSearchOnboarding),
    ).toBe('true')
  })
})
