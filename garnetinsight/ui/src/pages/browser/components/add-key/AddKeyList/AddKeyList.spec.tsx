import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { HEAD_DESTINATION } from 'uiSrc/pages/browser/modules/key-details/components/list-details/add-list-elements/AddListElements'
import AddKeyList, { Props } from './AddKeyList'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'

const mockedProps = mock<Props>()

const elementFindingRegex = /^element-\d+$/

jest.mock('../AddKeyFooter/AddKeyFooter', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const MockAddKeyFooter = (props) => <div {...props} />

describe('AddKeyList', () => {
  beforeAll(() => {
    AddKeyFooter.mockImplementation(MockAddKeyFooter)
  })

  it('should render', () => {
    expect(render(<AddKeyList {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should set value properly', () => {
    render(<AddKeyList {...instance(mockedProps)} />)
    const valueInput = screen.getByTestId(elementFindingRegex)
    const value = 'list list list list list list '
    fireEvent.change(valueInput, { target: { value } })
    expect(valueInput).toHaveValue(value)
  })

  it('should set destination properly', () => {
    render(<AddKeyList {...instance(mockedProps)} />)
    const destinationSelect = screen.getByTestId('destination-select')
    fireEvent.change(destinationSelect, { target: { value: HEAD_DESTINATION } })
    expect(destinationSelect).toHaveValue(HEAD_DESTINATION)
  })

  it('should render disabled add key button with empty keyName', () => {
    const { container } = render(<AddKeyList {...instance(mockedProps)} />)
    expect(container.querySelector('.btn-add')).toBeDisabled()
  })

  it('should not be disabled add key with proper values', () => {
    const { container } = render(
      <AddKeyList {...instance(mockedProps)} keyName="name" />,
    )
    expect(container.querySelector('.btn-add')).not.toBeDisabled()
  })

  it('should allow for adding multiple elements', () => {
    render(<AddKeyList {...instance(mockedProps)} keyName="name" />)
    fireEvent.click(screen.getByTestId('add-item'))
    const valueInputs = screen.getAllByTestId(elementFindingRegex)
    expect([...valueInputs].length).toBe(2)
  })

  it('should not allow deleting the last element', () => {
    render(<AddKeyList {...instance(mockedProps)} keyName="name" />)
    const deleteButtons = screen.getAllByTestId('remove-item')
    expect(deleteButtons[0]).toBeDisabled()
  })

  it('should allow deleting of the elements after the first one', () => {
    render(<AddKeyList {...instance(mockedProps)} keyName="name" />)
    fireEvent.click(screen.getByTestId('add-item'))
    const deleteButtons = screen.getAllByTestId('remove-item')
    expect(deleteButtons[1]).not.toBeDisabled()
  })
})
