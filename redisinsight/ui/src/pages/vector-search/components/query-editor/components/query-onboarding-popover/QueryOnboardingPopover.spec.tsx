import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import BrowserStorageItem from 'uiSrc/constants/storage'

import { QueryOnboardingPopover } from './QueryOnboardingPopover'

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
    ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

    renderComponent()

    const onboardingContent = screen.getByTestId(
      'query-library-onboarding-content',
    )
    const title = screen.getByText('Index created successfully.')

    expect(onboardingContent).toBeInTheDocument()
    expect(title).toBeInTheDocument()
  })

  it('should not show onboarding popover when already seen', () => {
    ;(localStorage.getItem as jest.Mock).mockReturnValue('true')

    renderComponent()

    const onboardingContent = screen.queryByTestId(
      'query-library-onboarding-content',
    )

    expect(onboardingContent).not.toBeInTheDocument()
  })

  it('should render children when popover is not shown', () => {
    ;(localStorage.getItem as jest.Mock).mockReturnValue('true')

    renderComponent()

    const trigger = screen.getByTestId('trigger')

    expect(trigger).toBeInTheDocument()
  })

  it('should mark as seen in localStorage when Got it is clicked', () => {
    ;(localStorage.getItem as jest.Mock).mockReturnValue(null)

    renderComponent()

    const dismissButton = screen.getByTestId('query-library-onboarding-dismiss')
    fireEvent.click(dismissButton)

    expect(localStorage.setItem).toHaveBeenCalledWith(
      BrowserStorageItem.vectorSearchQueryOnboarding,
      'true',
    )
  })
})
