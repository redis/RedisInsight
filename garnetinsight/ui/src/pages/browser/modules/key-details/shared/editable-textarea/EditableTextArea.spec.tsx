import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import EditableTextArea, { Props } from './EditableTextArea'

const mockedProps = mock<Props>()
const Text = () => <span data-testid="text">text</span>

describe('EditableTextArea', () => {
  it('should render', () => {
    expect(
      render(
        <EditableTextArea {...mockedProps}>
          <Text />
        </EditableTextArea>,
      ),
    ).toBeTruthy()
  })

  it('should display editor', () => {
    render(
      <EditableTextArea
        {...mockedProps}
        isEditing
        field="field"
        testIdPrefix="item"
        onDecline={jest.fn()}
      >
        <Text />
      </EditableTextArea>,
    )

    expect(screen.getByTestId('item_value-editor-field')).toBeInTheDocument()
  })

  it('should call on apply', () => {
    const onApply = jest.fn()
    render(
      <EditableTextArea
        {...mockedProps}
        isEditing
        field="field"
        testIdPrefix="item"
        onEdit={jest.fn()}
        onDecline={jest.fn()}
        onApply={onApply}
      >
        <Text />
      </EditableTextArea>,
    )

    fireEvent.change(screen.getByTestId('item_value-editor-field'), {
      target: { value: 'value' },
    })
    fireEvent.click(screen.getByTestId('apply-btn'))

    expect(onApply).toBeCalledWith('value', expect.any(Object))
  })

  it('should call on decline', () => {
    const onDecline = jest.fn()
    render(
      <EditableTextArea
        {...mockedProps}
        isEditing
        field="field"
        testIdPrefix="item"
        onEdit={jest.fn()}
        onDecline={onDecline}
      >
        <Text />
      </EditableTextArea>,
    )

    fireEvent.change(screen.getByTestId('item_value-editor-field'), {
      target: { value: 'value' },
    })
    fireEvent.click(screen.getByTestId('cancel-btn'))

    expect(onDecline).toBeCalled()
  })
})
