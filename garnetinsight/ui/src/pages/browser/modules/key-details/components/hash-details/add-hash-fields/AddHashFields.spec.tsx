import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import AddHashFields, { Props } from './AddHashFields'

const HASH_FIELD = 'hash-field'
const HASH_VALUE = 'hash-value'

const mockedProps = mock<Props>()

describe('AddHashFields', () => {
  it('should render', () => {
    expect(render(<AddHashFields {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set field name properly', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId(HASH_FIELD)
    fireEvent.change(fieldName, { target: { value: 'field name' } })
    expect(fieldName).toHaveValue('field name')
  })

  it('should set field value properly', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId(HASH_VALUE)
    fireEvent.change(fieldName, { target: { value: '123' } })
    expect(fieldName).toHaveValue('123')
  })

  it('should render add button', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    expect(screen.getByTestId('add-item')).toBeTruthy()
  })

  it('should render one more field name & value inputs after click add item', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('add-item'))

    expect(screen.getAllByTestId(HASH_FIELD)).toHaveLength(2)
    expect(screen.getAllByTestId(HASH_VALUE)).toHaveLength(2)
  })

  it('should clear fieldName & fieldValue after click clear button', () => {
    render(<AddHashFields {...instance(mockedProps)} />)
    const fieldName = screen.getByTestId(HASH_FIELD)
    const fieldValue = screen.getByTestId(HASH_VALUE)
    fireEvent.change(fieldName, { target: { value: 'name' } })
    fireEvent.change(fieldValue, { target: { value: 'val' } })
    fireEvent.click(screen.getByTestId('remove-item'))

    expect(fieldName).toHaveValue('')
    expect(fieldValue).toHaveValue('')
  })
})
