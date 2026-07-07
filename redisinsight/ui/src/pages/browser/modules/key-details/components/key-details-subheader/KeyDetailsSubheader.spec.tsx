import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { KeyTypes } from 'uiSrc/constants'
import { KeyDetailsSubheader, Props } from './KeyDetailsSubheader'

const mockedProps = mock<Props>()

const MockActions = () => <div data-testid="mock-actions" />

describe('KeyDetailsSubheader', () => {
  it('should render', () => {
    expect(
      render(<KeyDetailsSubheader {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('renders the value formatter for a supported key type', () => {
    render(<KeyDetailsSubheader keyType={KeyTypes.Hash} />)
    expect(screen.getByTestId('select-format-key-value')).toBeInTheDocument()
  })

  it('omits the trailing divider when no Actions are provided', () => {
    render(<KeyDetailsSubheader keyType={KeyTypes.Hash} />)
    expect(screen.getByTestId('select-format-key-value')).toBeInTheDocument()
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })

  it('renders the divider between the formatter and the Actions', () => {
    render(
      <KeyDetailsSubheader keyType={KeyTypes.Hash} Actions={MockActions} />,
    )
    expect(screen.getByTestId('select-format-key-value')).toBeInTheDocument()
    expect(screen.getByTestId('mock-actions')).toBeInTheDocument()
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })
})
