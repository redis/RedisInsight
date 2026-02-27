import React from 'react'
import { faker } from '@faker-js/faker'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'

import { useIndexNameValidation } from '../../../../hooks'
import { IndexNameEditor } from './IndexNameEditor'
import { IndexNameEditorProps } from './IndexNameEditor.types'

jest.mock('../../../../hooks', () => ({
  ...jest.requireActual('../../../../hooks'),
  useIndexNameValidation: jest.fn(() => null),
}))

const mockUseIndexNameValidation = useIndexNameValidation as jest.Mock

describe('IndexNameEditor', () => {
  const defaultProps: IndexNameEditorProps = {
    indexName: faker.string.alphanumeric(10),
    onNameChange: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<IndexNameEditorProps>) => {
    const props = { ...defaultProps, ...propsOverride }
    return render(<IndexNameEditor {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show index name with edit button by default', () => {
    renderComponent()

    const display = screen.getByTestId('index-name-display')
    const nameText = screen.getByText(defaultProps.indexName)
    const editBtn = screen.getByTestId('index-name-edit-btn')

    expect(display).toBeInTheDocument()
    expect(nameText).toBeInTheDocument()
    expect(editBtn).toBeInTheDocument()
  })

  it('should enter edit mode when clicking the display row', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('index-name-display'))

    const editInput = screen.getByTestId('index-name-edit-input')
    const cancelBtn = screen.getByTestId('index-name-cancel-btn')
    const confirmBtn = screen.getByTestId('index-name-confirm-btn')

    expect(editInput).toBeInTheDocument()
    expect(cancelBtn).toBeInTheDocument()
    expect(confirmBtn).toBeInTheDocument()
  })

  it('should call onNameChange and exit edit mode on confirm', () => {
    const onNameChange = jest.fn()
    renderComponent({ onNameChange })

    fireEvent.click(screen.getByTestId('index-name-display'))
    fireEvent.click(screen.getByTestId('index-name-confirm-btn'))

    const editInput = screen.queryByTestId('index-name-edit-input')

    expect(onNameChange).toHaveBeenCalledWith(defaultProps.indexName)
    expect(editInput).not.toBeInTheDocument()
  })

  it('should exit edit mode without calling onNameChange on cancel', () => {
    const onNameChange = jest.fn()
    renderComponent({ onNameChange })

    fireEvent.click(screen.getByTestId('index-name-display'))
    fireEvent.click(screen.getByTestId('index-name-cancel-btn'))

    const editInput = screen.queryByTestId('index-name-edit-input')

    expect(onNameChange).not.toHaveBeenCalled()
    expect(editInput).not.toBeInTheDocument()
  })

  it('should confirm on Enter key', () => {
    const onNameChange = jest.fn()
    renderComponent({ onNameChange })

    fireEvent.click(screen.getByTestId('index-name-display'))
    fireEvent.keyDown(screen.getByTestId('index-name-edit-input'), {
      key: 'Enter',
    })

    const editInput = screen.queryByTestId('index-name-edit-input')

    expect(onNameChange).toHaveBeenCalledWith(defaultProps.indexName)
    expect(editInput).not.toBeInTheDocument()
  })

  it('should cancel on Escape key', () => {
    const onNameChange = jest.fn()
    renderComponent({ onNameChange })

    fireEvent.click(screen.getByTestId('index-name-display'))
    fireEvent.keyDown(screen.getByTestId('index-name-edit-input'), {
      key: 'Escape',
    })

    const editInput = screen.queryByTestId('index-name-edit-input')

    expect(onNameChange).not.toHaveBeenCalled()
    expect(editInput).not.toBeInTheDocument()
  })

  it('should submit updated draft value on confirm', () => {
    const onNameChange = jest.fn()
    const newName = faker.string.alphanumeric(8)
    renderComponent({ onNameChange })

    fireEvent.click(screen.getByTestId('index-name-display'))
    fireEvent.change(screen.getByTestId('index-name-edit-input'), {
      target: { value: newName },
    })
    fireEvent.click(screen.getByTestId('index-name-confirm-btn'))

    expect(onNameChange).toHaveBeenCalledWith(newName)
  })

  it('should validate the draft value, not the committed indexName', () => {
    const errorMsg = 'An index with this name already exists.'
    mockUseIndexNameValidation.mockReturnValue(errorMsg)
    renderComponent()

    fireEvent.click(screen.getByTestId('index-name-display'))

    expect(screen.getByText(errorMsg)).toBeInTheDocument()
  })
})
