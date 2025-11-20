import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'

import ConfigurationCard, { ConfigurationCardProps } from './ConfigurationCard'

const mockedProps = mock<ConfigurationCardProps>()

const mockUseConfigurationState = jest.fn()
jest.mock('./hooks/useConfigurationState', () => ({
  useConfigurationState: () => mockUseConfigurationState(),
}))

describe('ConfigurationCard', () => {
  beforeEach(() => {
    mockUseConfigurationState.mockReturnValue({
      hasChanges: false,
      isValid: true,
      configValidationErrors: [],
    })
  })

  it('should render with correct title', () => {
    render(<ConfigurationCard {...instance(mockedProps)} />)

    expect(screen.getByText('Configuration')).toBeInTheDocument()
    expect(screen.getByText('Configuration file')).toBeInTheDocument()
  })

  it('should render with correct test id', () => {
    render(<ConfigurationCard {...instance(mockedProps)} />)

    expect(
      screen.getByTestId(`rdi-nav-btn-${RdiPipelineTabs.Config}`),
    ).toBeInTheDocument()
  })

  it('should call onSelect with Config tab when clicked', () => {
    const mockOnSelect = jest.fn()

    render(
      <ConfigurationCard {...instance(mockedProps)} onSelect={mockOnSelect} />,
    )

    fireEvent.click(screen.getByTestId(`rdi-nav-btn-${RdiPipelineTabs.Config}`))

    expect(mockOnSelect).toHaveBeenCalledWith(RdiPipelineTabs.Config)
  })

  it('should render as selected when isSelected is true', () => {
    render(<ConfigurationCard {...instance(mockedProps)} isSelected={true} />)

    const card = screen.getByTestId(`rdi-nav-btn-${RdiPipelineTabs.Config}`)
    expect(card).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<ConfigurationCard {...instance(mockedProps)} />)

    const card = screen.getByTestId(`rdi-nav-btn-${RdiPipelineTabs.Config}`)
    expect(card).toHaveAttribute('tabIndex', '0')
    expect(card).toHaveAttribute('role', 'button')
  })

  describe('Changes indicator', () => {
    it('should not show changes indicator when no changes', () => {
      mockUseConfigurationState.mockReturnValue({
        hasChanges: false,
        isValid: true,
        configValidationErrors: [],
      })

      render(<ConfigurationCard {...instance(mockedProps)} />)

      expect(
        screen.queryByTestId('updated-configuration-highlight'),
      ).not.toBeInTheDocument()
    })

    it('should show changes indicator when config has changes', () => {
      mockUseConfigurationState.mockReturnValue({
        hasChanges: true,
        isValid: true,
        configValidationErrors: [],
      })

      render(<ConfigurationCard {...instance(mockedProps)} />)

      expect(
        screen.getByTestId('updated-configuration-highlight'),
      ).toBeInTheDocument()
    })
  })

  describe('Validation errors', () => {
    it('should not show error icon when config is valid', () => {
      mockUseConfigurationState.mockReturnValue({
        hasChanges: false,
        isValid: true,
        configValidationErrors: [],
      })

      render(<ConfigurationCard {...instance(mockedProps)} />)

      expect(
        screen.queryByTestId('rdi-pipeline-nav__error-configuration'),
      ).not.toBeInTheDocument()
    })

    it('should show error icon when config has validation errors', () => {
      mockUseConfigurationState.mockReturnValue({
        hasChanges: false,
        isValid: false,
        configValidationErrors: [
          'Invalid configuration',
          'Missing required field',
        ],
      })

      render(<ConfigurationCard {...instance(mockedProps)} />)

      expect(
        screen.getByTestId('rdi-pipeline-nav__error-configuration'),
      ).toBeInTheDocument()
    })

    it('should handle single validation error', () => {
      mockUseConfigurationState.mockReturnValue({
        hasChanges: false,
        isValid: false,
        configValidationErrors: ['Single error'],
      })

      render(<ConfigurationCard {...instance(mockedProps)} />)

      expect(
        screen.getByTestId('rdi-pipeline-nav__error-configuration'),
      ).toBeInTheDocument()
    })
  })

  it('should show both changes indicator and error icon when config has changes and errors', () => {
    mockUseConfigurationState.mockReturnValue({
      hasChanges: true,
      isValid: false,
      configValidationErrors: ['Invalid configuration'],
    })

    render(<ConfigurationCard {...instance(mockedProps)} />)

    expect(
      screen.getByTestId('updated-configuration-highlight'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('rdi-pipeline-nav__error-configuration'),
    ).toBeInTheDocument()
  })
})
