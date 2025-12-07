import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import AddItemFieldAction, { Props } from './AddItemFieldAction'

const mockedProps = mock<Props>()

describe('AddItemFieldAction', () => {
  it('renders correctly with object type', () => {
    render(<AddItemFieldAction {...instance(mockedProps)} />)

    expect(screen.getByTestId('add-field-btn')).toBeInTheDocument()
    expect(screen.getByLabelText('Add field')).toBeInTheDocument()
  })

  it('triggers onClickSetKVPair when the button is clicked', () => {
    const onClickSetKVPair = jest.fn()
    render(
      <AddItemFieldAction
        {...instance(mockedProps)}
        onClickSetKVPair={onClickSetKVPair}
      />,
    )

    fireEvent.click(screen.getByTestId('add-field-btn'))
    expect(onClickSetKVPair).toHaveBeenCalled()
  })
})
