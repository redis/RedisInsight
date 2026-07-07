import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { ArrayValueEditorModal } from './ArrayValueEditorModal'

jest.mock('uiSrc/components/base/code-editor', () => {
  const ReactMock = require('react')
  return {
    __esModule: true,
    CodeEditor: (props: any) =>
      ReactMock.createElement('textarea', {
        'data-testid': 'array-value-code-editor',
        value: props.value,
        onChange: (e: any) => props.onChange?.(e.target.value),
      }),
  }
})

const defaultProps = {
  isOpen: true,
  index: '0',
  initialValue: 'hello',
  onSave: jest.fn(),
  onClose: jest.fn(),
}

const renderComponent = (props = {}) =>
  render(<ArrayValueEditorModal {...defaultProps} {...props} />)

describe('ArrayValueEditorModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('seeds the editor with initialValue when open', () => {
    renderComponent()
    expect(screen.getByTestId('array-value-code-editor')).toHaveValue('hello')
  })

  it('calls onSave with the edited value', () => {
    const onSave = jest.fn()
    renderComponent({ onSave })

    fireEvent.change(screen.getByTestId('array-value-code-editor'), {
      target: { value: 'edited value' },
    })
    fireEvent.click(screen.getByTestId('array-value-editor-save-btn'))

    expect(onSave).toHaveBeenCalledWith('edited value')
  })

  it('calls onClose and not onSave when cancelled', () => {
    const onSave = jest.fn()
    const onClose = jest.fn()
    renderComponent({ onSave, onClose })

    fireEvent.click(screen.getByTestId('array-value-editor-cancel-btn'))

    expect(onClose).toHaveBeenCalled()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('re-seeds the editor from initialValue when reopened', () => {
    const { rerender } = renderComponent({ initialValue: 'first' })
    fireEvent.change(screen.getByTestId('array-value-code-editor'), {
      target: { value: 'dirty' },
    })

    rerender(
      <ArrayValueEditorModal
        {...defaultProps}
        isOpen={false}
        initialValue="first"
      />,
    )
    rerender(
      <ArrayValueEditorModal {...defaultProps} isOpen initialValue="second" />,
    )

    expect(screen.getByTestId('array-value-code-editor')).toHaveValue('second')
  })
})
