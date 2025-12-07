import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import AddListElements, { HEAD_DESTINATION, Props } from './AddListElements'

const mockedProps = mock<Props>()

const elementFindingRegex = /^element-\d+$/

describe('AddListElements', () => {
  it('should render', () => {
    expect(render(<AddListElements {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set elements input properly', () => {
    render(<AddListElements {...instance(mockedProps)} />)
    const elementsInput = screen.getByTestId(elementFindingRegex)
    fireEvent.change(elementsInput, { target: { value: '123' } })
    expect(elementsInput).toHaveValue('123')
  })

  it('should set destination properly', () => {
    render(<AddListElements {...instance(mockedProps)} />)
    const destinationSelect = screen.getByTestId('destination-select')
    fireEvent.change(destinationSelect, { target: { value: HEAD_DESTINATION } })
    expect(destinationSelect).toHaveValue(HEAD_DESTINATION)
  })

  it('should allow for adding multiple elements', () => {
    render(<AddListElements {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-item'))
    const valueInputs = screen.getAllByTestId(elementFindingRegex)
    expect([...valueInputs].length).toBe(2)
  })

  it('should not allow deleting the last element', () => {
    render(<AddListElements {...instance(mockedProps)} />)
    const deleteButtons = screen.getAllByTestId('remove-item')
    expect(deleteButtons[0]).toBeDisabled()
  })

  it('should allow deleting of the elements after the first one', () => {
    render(<AddListElements {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-item'))
    const deleteButtons = screen.getAllByTestId('remove-item')
    expect(deleteButtons[1]).not.toBeDisabled()
  })
})
