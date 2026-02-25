import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import { validateScoreNumber } from 'uiSrc/utils'
import type { InlineItemEditorProps } from './InlineItemEditor.types'
import InlineItemEditor from './InlineItemEditor'

const mockedProps = mock<InlineItemEditorProps>()
export const INLINE_ITEM_EDITOR = 'inline-item-editor'

describe('InlineItemEditor', () => {
  it('should render', () => {
    expect(
      render(
        <InlineItemEditor {...instance(mockedProps)} onDecline={jest.fn()} />,
      ),
    ).toBeTruthy()
  })

  it('should change value properly', () => {
    render(
      <InlineItemEditor {...instance(mockedProps)} onDecline={jest.fn()} />,
    )
    fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), {
      target: { value: 'val' },
    })
    expect(screen.getByTestId(INLINE_ITEM_EDITOR)).toHaveValue('val')
  })

  it('should change value properly with validation', () => {
    render(
      <InlineItemEditor
        {...instance(mockedProps)}
        onDecline={jest.fn()}
        validation={validateScoreNumber}
      />,
    )
    fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), {
      target: { value: 'val123' },
    })
    expect(screen.getByTestId(INLINE_ITEM_EDITOR)).toHaveValue(
      validateScoreNumber('val123'),
    )
  })

  it('should be focused properly', () => {
    render(
      <InlineItemEditor {...instance(mockedProps)} onDecline={jest.fn()} />,
    )
    expect(screen.getByTestId(INLINE_ITEM_EDITOR)).toHaveFocus()
  })

  describe('approveByValidation', () => {
    it('should not render popover after click on Apply btn if approveByValidation return "true" in the props and onApply should be called', () => {
      const approveByValidationMock = jest.fn().mockReturnValue(true)
      const onApplyMock = jest.fn().mockReturnValue(false)
      const { queryByTestId } = render(
        <InlineItemEditor
          {...instance(mockedProps)}
          onApply={onApplyMock}
          onDecline={jest.fn()}
          approveByValidation={approveByValidationMock}
        />,
      )

      fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), {
        target: { value: 'val123' },
      })

      fireEvent.click(screen.getByTestId(/apply-btn/))
      expect(queryByTestId('approve-popover')).not.toBeInTheDocument()
      expect(onApplyMock).toBeCalled()
    })

    it('should render popover after click on Apply btn if approveByValidation return "false" in the props and onApply should not be called ', () => {
      const approveByValidationMock = jest.fn().mockReturnValue(false)
      const onApplyMock = jest.fn().mockReturnValue(false)
      const { queryByTestId } = render(
        <InlineItemEditor
          {...instance(mockedProps)}
          onApply={onApplyMock}
          onDecline={jest.fn()}
          approveByValidation={approveByValidationMock}
        />,
      )

      fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), {
        target: { value: 'val123' },
      })

      fireEvent.click(screen.getByTestId(/apply-btn/))
      expect(queryByTestId('confirm-popover')).toBeInTheDocument()
      expect(onApplyMock).not.toBeCalled()
    })

    it('should render popover after click on Apply btn if approveByValidation return "false" in the props and onApply should be called after click on Save btn', () => {
      const approveByValidationMock = jest.fn().mockReturnValue(false)
      const onApplyMock = jest.fn().mockReturnValue(false)
      const { queryByTestId } = render(
        <InlineItemEditor
          {...instance(mockedProps)}
          onApply={onApplyMock}
          onDecline={jest.fn()}
          approveByValidation={approveByValidationMock}
        />,
      )

      fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), {
        target: { value: 'val123' },
      })

      fireEvent.click(screen.getByTestId(/apply-btn/))
      expect(queryByTestId('confirm-popover')).toBeInTheDocument()
      expect(onApplyMock).not.toBeCalled()

      fireEvent.click(screen.getByTestId(/save-btn/))
      expect(onApplyMock).toBeCalled()
    })

    it('should not call onApply if form is invalid', () => {
      const onApplyMock = jest.fn().mockReturnValue(false)
      render(
        <InlineItemEditor
          {...instance(mockedProps)}
          isLoading
          onApply={onApplyMock}
          onDecline={jest.fn()}
        />,
      )

      expect(screen.getByTestId('apply-btn')).toBeDisabled()

      fireEvent.submit(screen.getByTestId(INLINE_ITEM_EDITOR))

      expect(onApplyMock).not.toBeCalled()
    })

    it('should call onApply if form is valid', () => {
      const onApplyMock = jest.fn().mockReturnValue(false)
      render(
        <InlineItemEditor
          {...instance(mockedProps)}
          onApply={onApplyMock}
          onDecline={jest.fn()}
        />,
      )

      fireEvent.change(screen.getByTestId(INLINE_ITEM_EDITOR), {
        target: { value: 'val123' },
      })

      expect(screen.getByTestId('apply-btn')).not.toBeDisabled()

      fireEvent.submit(screen.getByTestId(INLINE_ITEM_EDITOR))

      expect(onApplyMock).toBeCalled()
    })
  })
})
