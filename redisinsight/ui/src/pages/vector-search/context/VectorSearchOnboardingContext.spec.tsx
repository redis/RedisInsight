import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  VectorSearchOnboardingProvider,
  useVectorSearchOnboarding,
} from './VectorSearchOnboardingContext'
import { BrowserStorageItem } from 'uiSrc/constants'

const TestComponent: React.FC = () => {
  const { showOnboarding, setOnboardingSeen, setOnboardingSeenSilent } =
    useVectorSearchOnboarding()

  return (
    <div>
      <span data-testid="show-onboarding">
        {showOnboarding ? 'true' : 'false'}
      </span>

      <button onClick={setOnboardingSeen} data-testid="seen-btn">
        Seen
      </button>
      <button onClick={setOnboardingSeenSilent} data-testid="silent-btn">
        Silent
      </button>
    </div>
  )
}

const renderTestComponent = () =>
  render(
    <VectorSearchOnboardingProvider>
      <TestComponent />
    </VectorSearchOnboardingProvider>,
  )

describe('VectorSearchOnboardingContext', () => {
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

  afterEach(() => {
    store = {} // Reset the mock storage
  })

  it('should read initial value from localStorage', () => {
    localStorage.setItem(BrowserStorageItem.vectorSearchOnboarding, 'true')

    renderTestComponent()

    const showOnboarding = screen.getByTestId('show-onboarding')
    expect(showOnboarding.textContent).toBe('false')
  })

  it('should provide default fallback value when local storage is empty', () => {
    renderTestComponent()

    const showOnboarding = screen.getByTestId('show-onboarding')
    expect(showOnboarding.textContent).toBe('true')
  })

  it('should update state and localStorage when setOnboardingSeen is called', () => {
    renderTestComponent()

    // Update state and localStorage, to force re-render
    const markAsSeenBtn = screen.getByTestId('seen-btn')
    fireEvent.click(markAsSeenBtn)

    // State should update immediately
    const showOnboardingState = screen.getByTestId('show-onboarding')
    expect(showOnboardingState.textContent).toBe('false')

    // localStorage should also be updated
    const showOnboardingStorage = localStorage.getItem(
      BrowserStorageItem.vectorSearchOnboarding,
    )
    expect(showOnboardingStorage).toBe('true')
  })

  it('should update only localStorage when setOnboardingSeenSilent is called', () => {
    renderTestComponent()

    // Update localStorage only, to not force re-render
    const markAsSeenSilentBtn = screen.getByTestId('silent-btn')
    fireEvent.click(markAsSeenSilentBtn)

    // localStorage should be updated
    const showOnboardingStorage = localStorage.getItem(
      BrowserStorageItem.vectorSearchOnboarding,
    )
    expect(showOnboardingStorage).toBe('true')

    // State should remain intact
    const showOnboardingState = screen.getByTestId('show-onboarding')
    expect(showOnboardingState.textContent).toBe('true')
  })

  it('should throw if used outside provider', () => {
    // Suppress error output for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const BrokenComponent = () => {
      useVectorSearchOnboarding()
      return null
    }

    expect(() => render(<BrokenComponent />)).toThrow(
      'useVectorSearchOnboarding must be used within a VectorSearchOnboardingProvider',
    )

    // Restore console error
    spy.mockRestore()
  })
})
