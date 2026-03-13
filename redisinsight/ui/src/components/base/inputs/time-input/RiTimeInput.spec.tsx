import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { RiTimeInput } from './RiTimeInput'
import { RiTimeInputProps } from './RiTimeInput.types'

describe('RiTimeInput', () => {
  const defaultProps: RiTimeInputProps = {
    value: '14:30:45',
    onChange: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<RiTimeInputProps>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<RiTimeInput {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render', () => {
    renderComponent()
    expect(screen.getByTestId('ri-time-input')).toBeInTheDocument()
  })

  it('should display the label', () => {
    renderComponent()
    expect(screen.getByText('Time')).toBeInTheDocument()
  })

  it('should allow custom label', () => {
    renderComponent({ label: 'Start Time' })
    expect(screen.getByText('Start Time')).toBeInTheDocument()
  })

  it('should hide label when empty string', () => {
    renderComponent({ label: '' })
    expect(screen.queryByText('Time')).not.toBeInTheDocument()
  })

  it('should display provided value', () => {
    renderComponent()
    expect(screen.getByTestId('ri-time-input-field')).toBeInTheDocument()
  })

  it('should render time input field', () => {
    renderComponent()
    const wrapper = screen.getByTestId('ri-time-input-field')
    expect(wrapper).toBeInTheDocument()
  })

  it('should render with default time when no value prop', () => {
    renderComponent({ value: undefined })
    expect(screen.getByTestId('ri-time-input-field')).toBeInTheDocument()
  })

  it('should render with provided value', () => {
    renderComponent({ value: '10:15:30' })
    expect(screen.getByTestId('ri-time-input-field')).toBeInTheDocument()
  })
})
