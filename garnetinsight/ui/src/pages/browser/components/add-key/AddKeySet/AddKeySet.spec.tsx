import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import AddKeySet, { Props } from './AddKeySet'

const mockedProps = mock<Props>()

describe('AddKeyZset', () => {
  it('should render', () => {
    expect(render(<AddKeySet {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set member value properly', () => {
    render(<AddKeySet {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId('member-name')
    fireEvent.change(memberInput, { target: { value: 'member name' } })
    expect(memberInput).toHaveValue('member name')
  })

  it('should render add button', () => {
    render(<AddKeySet {...instance(mockedProps)} />)
    expect(screen.getByTestId('add-item')).toBeTruthy()
  })

  it('should render one more member input after click add item', () => {
    render(<AddKeySet {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-item'))

    expect(screen.getAllByTestId('member-name')).toHaveLength(2)
  })

  it('should remove one member input after add item & remove one', () => {
    render(<AddKeySet {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-item'))

    expect(screen.getAllByTestId('member-name')).toHaveLength(2)

    const removeButtons = screen.getAllByTestId('remove-item')
    fireEvent.click(removeButtons[1])

    expect(screen.getAllByTestId('member-name')).toHaveLength(1)
  })

  it('should clear member after click clear button', () => {
    render(<AddKeySet {...instance(mockedProps)} />)
    const memberInput = screen.getByTestId('member-name')
    fireEvent.change(memberInput, { target: { value: 'member' } })
    fireEvent.click(screen.getByTestId('remove-item'))

    expect(memberInput).toHaveValue('')
  })
})
