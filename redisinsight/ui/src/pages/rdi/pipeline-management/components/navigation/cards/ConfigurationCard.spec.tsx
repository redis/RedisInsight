import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { RdiPipelineTabs } from 'uiSrc/slices/interfaces'

import ConfigurationCard, { ConfigurationCardProps } from './ConfigurationCard'

const mockedProps = mock<ConfigurationCardProps>()

describe('ConfigurationCard', () => {
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
})
