import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import EditableInput, { Props } from './EditableInput'

const mockedProps = mock<Props>()
const Text = () => <span data-testid="text">text</span>

describe('EditableInput', () => {
  it('should render', () => {
    expect(
      render(
        <EditableInput {...mockedProps}>
          <Text />
        </EditableInput>,
      ),
    ).toBeTruthy()
  })

  it('should display editor', () => {
    render(
      <EditableInput
        {...mockedProps}
        isEditing
        field="field"
        testIdPrefix="item"
        onDecline={jest.fn()}
      >
        <Text />
      </EditableInput>,
    )

    expect(screen.getByTestId('inline-item-editor')).toBeInTheDocument()
  })

  it('should call on apply', () => {
    const onApply = jest.fn()
    render(
      <EditableInput
        {...mockedProps}
        isEditing
        field="field"
        testIdPrefix="item"
        onEdit={jest.fn()}
        onDecline={jest.fn()}
        onApply={onApply}
      >
        <Text />
      </EditableInput>,
    )

    fireEvent.change(screen.getByTestId('inline-item-editor'), {
      target: { value: 'value' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(onApply).toBeCalledWith('value', expect.any(Object))
  })

  it('should call on decline', () => {
    const onDecline = jest.fn()
    render(
      <EditableInput
        {...mockedProps}
        isEditing
        field="field"
        testIdPrefix="item"
        onEdit={jest.fn()}
        onDecline={onDecline}
      >
        <Text />
      </EditableInput>,
    )

    fireEvent.change(screen.getByTestId('inline-item-editor'), {
      target: { value: 'value' },
    })
    fireEvent.click(screen.getByTestId('cancel-btn'))

    expect(onDecline).toBeCalled()
  })
})
