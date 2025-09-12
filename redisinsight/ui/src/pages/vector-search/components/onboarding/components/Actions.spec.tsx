import React from 'react'

import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import {
  VectorSearchOnboardingContext,
  VectorSearchOnboardingContextType,
} from 'uiSrc/pages/vector-search/context/VectorSearchOnboardingContext'
import Actions from './Actions'
import useStartWizard from 'uiSrc/pages/vector-search/hooks/useStartWizard'

jest.mock('uiSrc/pages/vector-search/hooks/useStartWizard', () => jest.fn())

const renderActionsComponent = (
  contextValue?: Partial<VectorSearchOnboardingContextType>,
) => {
  const defaultContextValue: VectorSearchOnboardingContextType = {
    showOnboarding: false,
    setOnboardingSeen: jest.fn(),
    setOnboardingSeenSilent: jest.fn(),
    ...contextValue,
  }

  return render(
    <VectorSearchOnboardingContext.Provider value={defaultContextValue}>
      <Actions />
    </VectorSearchOnboardingContext.Provider>,
  )
}

describe('Actions', () => {
  const mockUseStartWizard = useStartWizard as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    renderActionsComponent()

    const container = screen.getByTestId('vector-search-onboarding--actions')
    expect(container).toBeInTheDocument()

    // Verify buttons are rendered
    const exploreButton = screen.getByText(/Explore vector search/i)
    const skipButton = screen.getByText(/Skip for now/i)

    expect(exploreButton).toBeInTheDocument()
    expect(skipButton).toBeInTheDocument()
  })

  it('should call setOnboardingSeen when "Skip for now" button is clicked', () => {
    const mockSetOnboardingSeen = jest.fn()

    renderActionsComponent({ setOnboardingSeen: mockSetOnboardingSeen })

    const skipButton = screen.getByText(/Skip for now/i)
    expect(skipButton).toBeInTheDocument()

    // Simulate button click and verify the function is called
    fireEvent.click(skipButton)
    expect(mockSetOnboardingSeen).toHaveBeenCalled()
  })

  it('should call startOnboardingWizard when "Explore vector search" is clicked', () => {
    const mockStartOnboardingWizard = jest.fn()
    mockUseStartWizard.mockReturnValue(mockStartOnboardingWizard)

    renderActionsComponent()

    const exploreButton = screen.getByText(/Explore vector search/i)
    expect(exploreButton).toBeInTheDocument()

    // Simulate button click and verify the function is called
    fireEvent.click(exploreButton)
    expect(mockStartOnboardingWizard).toHaveBeenCalled()
  })
})
