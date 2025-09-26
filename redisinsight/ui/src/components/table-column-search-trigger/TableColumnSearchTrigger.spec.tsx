import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import TableColumnSearchTrigger, { Props } from './TableColumnSearchTrigger'

const mockedProps = mock<Props>()

describe('TableColumnSearchTrigger', () => {
  it('should render', () => {
    expect(
      render(<TableColumnSearchTrigger {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should change search value', () => {
    render(<TableColumnSearchTrigger {...instance(mockedProps)} isOpen />)
    const searchInput = screen.getByTestId('search')
    fireEvent.change(searchInput, {
      target: { value: '*1*' },
    })
    expect(searchInput).toHaveValue('*1*')
  })

  it('should call "handleOpenState" on search blur if input is empty', () => {
    const handleOpenState = jest.fn()

    render(
      <TableColumnSearchTrigger
        {...instance(mockedProps)}
        isOpen
        handleOpenState={handleOpenState}
      />,
    )

    const searchInput = screen.getByTestId('search')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveValue('')

    fireEvent.blur(searchInput)
    expect(handleOpenState).toHaveBeenCalledWith(false)
  })

  it('should not call "handleOpenState" on search blur if input has value', () => {
    const handleOpenState = jest.fn()

    render(
      <TableColumnSearchTrigger
        {...instance(mockedProps)}
        isOpen
        handleOpenState={handleOpenState}
      />,
    )

    const searchInput = screen.getByTestId('search')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveValue('')

    fireEvent.change(searchInput, {
      target: { value: '*1*' },
    })

    expect(searchInput).toHaveValue('*1*')

    fireEvent.blur(searchInput)
    expect(handleOpenState).not.toHaveBeenCalled()
  })
})
