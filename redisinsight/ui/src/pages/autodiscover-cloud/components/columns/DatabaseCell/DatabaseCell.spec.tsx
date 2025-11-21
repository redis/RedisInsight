import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'

import { DatabaseCellRenderer } from './DatabaseCell'

describe('DatabaseCellRenderer', () => {
  it('should render database name', () => {
    const name = 'test-database'
    render(<DatabaseCellRenderer name={name} />)

    expect(screen.getByText(name)).toBeInTheDocument()
  })

  it('should render with testid', () => {
    const name = 'my-db'
    render(<DatabaseCellRenderer name={name} />)

    expect(screen.getByTestId(`db_name_${name}`)).toBeInTheDocument()
  })

  it('should truncate long names to 200 characters', () => {
    const longName = 'a'.repeat(300)
    render(<DatabaseCellRenderer name={longName} />)

    const displayedText = screen.getByText('a'.repeat(200))
    expect(displayedText).toBeInTheDocument()
  })

  it('should replace spaces in names', () => {
    const nameWithSpaces = 'my database name'
    render(<DatabaseCellRenderer name={nameWithSpaces} />)

    // replaceSpaces replaces spaces with nbsp
    const element = screen.getByTestId(`db_name_${nameWithSpaces}`)
    expect(element).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const name = 'test-db'
    const customClass = 'custom-class'
    const { container } = render(
      <DatabaseCellRenderer name={name} className={customClass} />,
    )

    const element = container.querySelector(`.${customClass}`)
    expect(element).toBeInTheDocument()
  })
})

