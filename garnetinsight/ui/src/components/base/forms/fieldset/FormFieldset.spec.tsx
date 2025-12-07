/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { FormFieldset, FormFieldsetProps } from './FormFieldset'

const defaultProps: FormFieldsetProps = {
  children: <div data-testid="fieldset-content">Test content</div>,
}

describe('FormFieldset', () => {
  it('should render', () => {
    expect(render(<FormFieldset {...defaultProps} />)).toBeTruthy()
  })

  it('should render children', () => {
    render(<FormFieldset {...defaultProps} />)

    expect(screen.getByTestId('fieldset-content')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render as fieldset element', () => {
    render(<FormFieldset {...defaultProps} />)

    const fieldset = screen.getByRole('group')
    expect(fieldset.tagName).toBe('FIELDSET')
  })

  it('should render without legend when legend prop is not provided', () => {
    render(<FormFieldset {...defaultProps} />)

    expect(screen.queryByRole('legend')).not.toBeInTheDocument()
  })

  it('should render legend when legend prop is provided', () => {
    render(
      <FormFieldset {...defaultProps} legend={{ children: 'Test Legend' }} />,
    )

    expect(screen.getByText('Test Legend')).toBeInTheDocument()
  })

  it('should render legend with custom content', () => {
    const legendContent = (
      <span data-testid="custom-legend">Custom Legend Content</span>
    )

    render(
      <FormFieldset {...defaultProps} legend={{ children: legendContent }} />,
    )

    expect(screen.getByTestId('custom-legend')).toBeInTheDocument()
    expect(screen.getByText('Custom Legend Content')).toBeInTheDocument()
  })

  it('should not render legend when display is hidden', () => {
    render(
      <FormFieldset
        {...defaultProps}
        legend={{
          children: 'Hidden Legend',
          display: 'hidden',
        }}
      />,
    )

    expect(screen.queryByText('Hidden Legend')).not.toBeInTheDocument()
  })

  it('should render legend when display is visible', () => {
    render(
      <FormFieldset
        {...defaultProps}
        legend={{
          children: 'Visible Legend',
          display: 'visible',
        }}
      />,
    )

    expect(screen.getByText('Visible Legend')).toBeInTheDocument()
  })

  it('should render legend when display is not specified (defaults to visible)', () => {
    render(
      <FormFieldset
        {...defaultProps}
        legend={{ children: 'Default Legend' }}
      />,
    )

    expect(screen.getByText('Default Legend')).toBeInTheDocument()
  })

  it('should pass through HTML attributes to fieldset element', () => {
    render(
      <FormFieldset
        {...defaultProps}
        data-testid="custom-fieldset"
        className="custom-class"
        id="custom-id"
      />,
    )

    const fieldset = screen.getByTestId('custom-fieldset')
    expect(fieldset).toHaveClass('custom-class')
    expect(fieldset).toHaveAttribute('id', 'custom-id')
  })

  it('should pass through HTML attributes to legend element', () => {
    render(
      <FormFieldset
        {...defaultProps}
        legend={{
          children: 'Legend with attributes',
          // @ts-ignore
          'data-testid': 'custom-legend',
          className: 'legend-class',
          id: 'legend-id',
        }}
      />,
    )

    const legend = screen.getByTestId('custom-legend')
    expect(legend).toHaveClass('legend-class')
    expect(legend).toHaveAttribute('id', 'legend-id')
  })

  it('should handle multiple children', () => {
    render(
      <FormFieldset>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <input data-testid="input-field" type="text" />
      </FormFieldset>,
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('input-field')).toBeInTheDocument()
  })

  it('should handle form elements as children', () => {
    render(
      <FormFieldset legend={{ children: 'Form Fields' }}>
        <label htmlFor="name">Name:</label>
        <input id="name" type="text" data-testid="name-input" />
        <label htmlFor="email">Email:</label>
        <input id="email" type="email" data-testid="email-input" />
      </FormFieldset>,
    )

    expect(screen.getByText('Form Fields')).toBeInTheDocument()
    expect(screen.getByLabelText('Name:')).toBeInTheDocument()
    expect(screen.getByLabelText('Email:')).toBeInTheDocument()
    expect(screen.getByTestId('name-input')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
  })

  it('should handle empty children', () => {
    render(<FormFieldset />)

    const fieldset = screen.getByRole('group')
    expect(fieldset).toBeInTheDocument()
    expect(fieldset).toBeEmptyDOMElement()
  })

  it('should handle null children', () => {
    render(<FormFieldset>{null}</FormFieldset>)

    const fieldset = screen.getByRole('group')
    expect(fieldset).toBeInTheDocument()
  })

  it('should handle undefined children', () => {
    render(<FormFieldset>{undefined}</FormFieldset>)

    const fieldset = screen.getByRole('group')
    expect(fieldset).toBeInTheDocument()
  })

  it('should handle complex legend with multiple elements', () => {
    const complexLegend = (
      <div>
        <strong>Important:</strong>
        <span> Please fill all required fields</span>
      </div>
    )

    render(
      <FormFieldset {...defaultProps} legend={{ children: complexLegend }} />,
    )

    expect(screen.getByText('Important:')).toBeInTheDocument()
    expect(
      screen.getByText('Please fill all required fields'),
    ).toBeInTheDocument()
  })
})
