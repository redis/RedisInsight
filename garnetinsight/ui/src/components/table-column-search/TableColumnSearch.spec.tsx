import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import TableColumnSearch, { Props } from './TableColumnSearch'

const mockedProps = mock<Props>()

describe('TableColumnSearch', () => {
  it('should render', () => {
    expect(
      render(<TableColumnSearch {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should change search value', () => {
    render(<TableColumnSearch {...instance(mockedProps)} />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, {
      target: { value: '*1*' },
    })
    expect(searchInput).toHaveValue('*1*')
  })
})
