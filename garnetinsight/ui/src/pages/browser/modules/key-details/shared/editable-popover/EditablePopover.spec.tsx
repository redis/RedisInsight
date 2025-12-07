import React from 'react'
import { mock } from 'ts-mockito'
import { act, fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import EditablePopover, { Props } from './EditablePopover'

const mockedProps = mock<Props>()
const Input = () => <input data-testid="input" />
const Text = () => <span data-testid="text" />

describe('EditableInput', () => {
  it('should render', () => {
    expect(
      render(
        <EditablePopover {...mockedProps}>
          <Input />
        </EditablePopover>,
      ),
    ).toBeTruthy()
  })

  it('should not display popover, display content', () => {
    render(
      <EditablePopover {...mockedProps} content={<Text />}>
        <Input />
      </EditablePopover>,
    )

    expect(screen.queryByTestId('input')).not.toBeInTheDocument()
    expect(screen.getByTestId('text')).toBeInTheDocument()
  })

  it('should display popover', () => {
    render(
      <EditablePopover {...mockedProps}>
        <Text />
      </EditablePopover>,
    )

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('_content-value-'))
    })
    fireEvent.click(screen.getByTestId('_edit-btn-'))
    expect(screen.getByTestId('popover-item-editor')).toBeInTheDocument()
  })

  it('should hide edit button when no editable', () => {
    render(
      <EditablePopover {...mockedProps} isDisabledEditButton>
        <Text />
      </EditablePopover>,
    )

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('_content-value-'))
    })
    expect(screen.queryByTestId('_edit-btn-')).not.toBeInTheDocument()
  })

  it('should call on apply', () => {
    const onApply = jest.fn()
    render(
      <EditablePopover
        {...mockedProps}
        isOpen
        onDecline={jest.fn()}
        onApply={onApply}
        content={<Input />}
      >
        <Text />
      </EditablePopover>,
    )

    fireEvent.change(screen.getByTestId('input'), {
      target: { value: 'value' },
    })
    fireEvent.click(screen.getByTestId('save-btn'))

    expect(onApply).toBeCalled()
  })

  it('should call on decline', () => {
    const onDecline = jest.fn()
    render(
      <EditablePopover {...mockedProps} isOpen onDecline={onDecline}>
        <Text />
      </EditablePopover>,
    )

    fireEvent.click(screen.getByTestId('cancel-btn'))

    expect(onDecline).toBeCalled()
  })
})
