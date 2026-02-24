import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import BrowserStorageItem from 'uiSrc/constants/storage'
import { localStorageService } from 'uiSrc/services'

import { QueryOnboardingPopover } from './QueryOnboardingPopover'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

describe('QueryOnboardingPopover', () => {
  const renderComponent = () =>
    render(
      <QueryOnboardingPopover>
        <button type="button" data-testid="trigger">
          Trigger
        </button>
      </QueryOnboardingPopover>,
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show onboarding popover on first visit', () => {
    ;(localStorageService.get as jest.Mock).mockReturnValue(null)

    renderComponent()

    const onboardingContent = screen.getByTestId(
      'query-library-onboarding-content',
    )
    const title = screen.getByText('Index created successfully.')

    expect(onboardingContent).toBeInTheDocument()
    expect(title).toBeInTheDocument()
  })

  it('should not show onboarding popover when already seen', () => {
    ;(localStorageService.get as jest.Mock).mockReturnValue(true)

    renderComponent()

    const onboardingContent = screen.queryByTestId(
      'query-library-onboarding-content',
    )

    expect(onboardingContent).not.toBeInTheDocument()
  })

  it('should render children when popover is not shown', () => {
    ;(localStorageService.get as jest.Mock).mockReturnValue(true)

    renderComponent()

    const trigger = screen.getByTestId('trigger')

    expect(trigger).toBeInTheDocument()
  })

  it('should mark as seen in localStorage when Got it is clicked', () => {
    ;(localStorageService.get as jest.Mock).mockReturnValue(null)

    renderComponent()

    const dismissButton = screen.getByTestId('query-library-onboarding-dismiss')
    fireEvent.click(dismissButton)

    expect(localStorageService.set).toHaveBeenCalledWith(
      BrowserStorageItem.vectorSearchQueryOnboarding,
      true,
    )
  })
})
