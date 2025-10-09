import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { QueryCard } from './QueryCard'

describe('SavedQueries/QueryCard', () => {
  const onQueryInsert = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders label and button', () => {
    const { container } = render(
      <QueryCard
        label={'Search for "Nord" bikes ordered by price'}
        value={'FT.SEARCH idx:bikes_vss "@brand:Nord" SORTBY price ASC'}
        onQueryInsert={onQueryInsert}
      />,
    )

    expect(container).toBeTruthy()
    expect(
      screen.getByText('Search for "Nord" bikes ordered by price'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('btn-insert-query')).toBeInTheDocument()
  })

  it('calls onQueryInsert with value when Insert is clicked', () => {
    render(
      <QueryCard
        label="Find road alloy bikes under 20kg"
        value={'FT.SEARCH idx:bikes_vss "@material:{alloy} @weight:[0 20]"'}
        onQueryInsert={onQueryInsert}
      />,
    )

    fireEvent.click(screen.getByTestId('btn-insert-query'))

    expect(onQueryInsert).toHaveBeenCalledTimes(1)
    expect(onQueryInsert).toHaveBeenCalledWith(
      'FT.SEARCH idx:bikes_vss "@material:{alloy} @weight:[0 20]"',
    )
  })
})
