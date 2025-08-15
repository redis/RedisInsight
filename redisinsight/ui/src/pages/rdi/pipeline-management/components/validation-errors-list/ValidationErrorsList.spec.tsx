import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import ValidationErrorsList, { Props } from './ValidationErrorsList'

describe('ValidationErrorsList', () => {
  it('should render', () => {
    const props: Props = {
      validationErrors: []
    }
    expect(render(<ValidationErrorsList {...props} />)).toBeTruthy()
  })

  it('should not render anything when validationErrors is undefined', () => {
    const props: Props = {
      validationErrors: undefined as any
    }
    const { container } = render(<ValidationErrorsList {...props} />)

    expect(container.firstChild).toBeNull()
  })

  it('should render a single validation error', () => {
    const props: Props = {
      validationErrors: ['Invalid configuration format']
    }
    render(<ValidationErrorsList {...props} />)

    expect(screen.getByText('Invalid configuration format')).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('should render multiple validation errors', () => {
    const props: Props = {
      validationErrors: [
        'Missing required field: name',
        'Invalid data type for age',
        'Email format is incorrect'
      ]
    }
    render(<ValidationErrorsList {...props} />)

    expect(screen.getByText('Missing required field: name')).toBeInTheDocument()
    expect(screen.getByText('Invalid data type for age')).toBeInTheDocument()
    expect(screen.getByText('Email format is incorrect')).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('should render validation errors as list items within a Text component', () => {
    const props: Props = {
      validationErrors: ['Error message 1', 'Error message 2']
    }
    render(<ValidationErrorsList {...props} />)

    const list = screen.getByRole('list')
    expect(list.tagName).toBe('UL')
    expect(list.parentElement?.tagName).toBe('DIV')

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(2)
    expect(listItems[0]).toHaveTextContent('Error message 1')
    expect(listItems[1]).toHaveTextContent('Error message 2')
  })

  it('should handle special characters and HTML in error messages', () => {
    const props: Props = {
      validationErrors: [
        'Error with <script>alert("xss")</script>',
        'Error with & special characters',
        'Error with "quotes" and \'apostrophes\''
      ]
    }
    render(<ValidationErrorsList {...props} />)

    expect(screen.getByText('Error with <script>alert("xss")</script>')).toBeInTheDocument()
    expect(screen.getByText('Error with & special characters')).toBeInTheDocument()
    expect(screen.getByText('Error with "quotes" and \'apostrophes\'')).toBeInTheDocument()
  })

  it('should handle empty string errors', () => {
    const props: Props = {
      validationErrors: ['', 'Valid error message', '']
    }
    render(<ValidationErrorsList {...props} />)

    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(3)
    expect(listItems[0]).toHaveTextContent('')
    expect(listItems[1]).toHaveTextContent('Valid error message')
    expect(listItems[2]).toHaveTextContent('')
  })
})
