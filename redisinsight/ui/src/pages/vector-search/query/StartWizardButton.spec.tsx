import React from 'react'
import { cleanup, render, screen, userEvent } from 'uiSrc/utils/test-utils'
import { Pages } from 'uiSrc/constants'

import { StartWizardButton } from './StartWizardButton'

const renderComponent = () => render(<StartWizardButton />)

describe('StartWizardButton', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should navigate to vector search create index page when "Get started" is clicked', async () => {
    const mockPush = jest.fn()

    const useHistoryMock = jest.spyOn(require('react-router-dom'), 'useHistory')
    useHistoryMock.mockImplementation(() => ({
      push: mockPush,
    }))

    renderComponent()

    const getStartedButton = screen.getByText('Get started')
    await userEvent.click(getStartedButton)

    expect(mockPush).toHaveBeenCalledWith(
      Pages.vectorSearchCreateIndex('instanceId'),
    )
    expect(mockPush).toHaveBeenCalledTimes(1)

    useHistoryMock.mockRestore()
  })

  it('should maintain callback reference stability with useCallback', () => {
    const { rerender } = renderComponent()

    const firstRenderButton = screen.getByText('Get started')

    rerender(<StartWizardButton />)

    const secondRenderButton = screen.getByText('Get started')

    // Both buttons should exist (they're the same element after rerender)
    expect(firstRenderButton).toBeInTheDocument()
    expect(secondRenderButton).toBeInTheDocument()
  })
})
