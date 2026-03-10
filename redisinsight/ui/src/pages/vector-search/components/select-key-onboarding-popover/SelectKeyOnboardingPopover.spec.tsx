import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import BrowserStorageItem from 'uiSrc/constants/storage'
import { localStorageService } from 'uiSrc/services'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'

import { SelectKeyOnboardingPopover } from './SelectKeyOnboardingPopover'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeyDataSelector: jest.fn().mockReturnValue(null),
}))

describe('SelectKeyOnboardingPopover', () => {
  const renderComponent = () =>
    render(
      <SelectKeyOnboardingPopover>
        <button type="button" data-testid="trigger">
          Trigger
        </button>
      </SelectKeyOnboardingPopover>,
    )

  beforeEach(() => {
    jest.clearAllMocks()
    ;(selectedKeyDataSelector as jest.Mock).mockReturnValue(null)
  })

  it('should show popover on first visit', () => {
    ;(localStorageService.get as jest.Mock).mockReturnValue(null)

    renderComponent()

    expect(
      screen.getByTestId('select-key-onboarding-content'),
    ).toBeInTheDocument()
    expect(screen.getByText('Select a key to get started')).toBeInTheDocument()
  })

  it('should not show popover when already seen', () => {
    ;(localStorageService.get as jest.Mock).mockReturnValue(true)

    renderComponent()

    expect(
      screen.queryByTestId('select-key-onboarding-content'),
    ).not.toBeInTheDocument()
    expect(screen.getByTestId('trigger')).toBeInTheDocument()
  })

  it('should dismiss and persist on Got it click', () => {
    ;(localStorageService.get as jest.Mock).mockReturnValue(null)

    renderComponent()

    fireEvent.click(screen.getByTestId('select-key-onboarding-dismiss'))

    expect(localStorageService.set).toHaveBeenCalledWith(
      BrowserStorageItem.vectorSearchSelectKeyOnboarding,
      true,
    )
    expect(
      screen.queryByTestId('select-key-onboarding-content'),
    ).not.toBeInTheDocument()
  })

  it('should dismiss and persist on X close click', () => {
    ;(localStorageService.get as jest.Mock).mockReturnValue(null)

    renderComponent()

    fireEvent.click(screen.getByTestId('select-key-onboarding-close'))

    expect(localStorageService.set).toHaveBeenCalledWith(
      BrowserStorageItem.vectorSearchSelectKeyOnboarding,
      true,
    )
    expect(
      screen.queryByTestId('select-key-onboarding-content'),
    ).not.toBeInTheDocument()
  })
})
