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

    const indexNameDisplay = screen.getByTestId('index-name-display')
    fireEvent.click(indexNameDisplay)

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

    const indexNameDisplay = screen.getByTestId('index-name-display')
    fireEvent.click(indexNameDisplay)

    const confirmBtn = screen.getByTestId('index-name-confirm-btn')
    fireEvent.click(confirmBtn)

    const editInput = screen.queryByTestId('index-name-edit-input')

    expect(onNameChange).toHaveBeenCalledWith(defaultProps.indexName)
    expect(editInput).not.toBeInTheDocument()
  })

  it('should exit edit mode without calling onNameChange on cancel', () => {
    const onNameChange = jest.fn()
    renderComponent({ onNameChange })

    const indexNameDisplay = screen.getByTestId('index-name-display')
    fireEvent.click(indexNameDisplay)

    const cancelBtn = screen.getByTestId('index-name-cancel-btn')
    fireEvent.click(cancelBtn)

    const editInput = screen.queryByTestId('index-name-edit-input')

    expect(onNameChange).not.toHaveBeenCalled()
    expect(editInput).not.toBeInTheDocument()
  })

  it('should confirm on Enter key', () => {
    const onNameChange = jest.fn()
    renderComponent({ onNameChange })

    const indexNameDisplay = screen.getByTestId('index-name-display')
    fireEvent.click(indexNameDisplay)

    const editInput = screen.getByTestId('index-name-edit-input')
    fireEvent.keyDown(editInput, { key: 'Enter' })

    const editInputAfter = screen.queryByTestId('index-name-edit-input')

    expect(onNameChange).toHaveBeenCalledWith(defaultProps.indexName)
    expect(editInputAfter).not.toBeInTheDocument()
  })

  it('should cancel on Escape key', () => {
    const onNameChange = jest.fn()
    renderComponent({ onNameChange })

    const indexNameDisplay = screen.getByTestId('index-name-display')
    fireEvent.click(indexNameDisplay)

    const editInput = screen.getByTestId('index-name-edit-input')
    fireEvent.keyDown(editInput, { key: 'Escape' })

    const editInputAfter = screen.queryByTestId('index-name-edit-input')

    expect(onNameChange).not.toHaveBeenCalled()
    expect(editInputAfter).not.toBeInTheDocument()
  })

  it('should submit updated draft value on confirm', () => {
    const onNameChange = jest.fn()
    const newName = faker.string.alphanumeric(8)
    renderComponent({ onNameChange })

    const indexNameDisplay = screen.getByTestId('index-name-display')
    fireEvent.click(indexNameDisplay)

    const editInput = screen.getByTestId('index-name-edit-input')
    fireEvent.change(editInput, { target: { value: newName } })

    const confirmBtn = screen.getByTestId('index-name-confirm-btn')
    fireEvent.click(confirmBtn)

    expect(onNameChange).toHaveBeenCalledWith(newName)
  })

  it('should validate the draft value, not the committed indexName', () => {
    const errorMsg = 'An index with this name already exists.'
    mockUseIndexNameValidation.mockReturnValue(errorMsg)
    renderComponent()

    const indexNameDisplay = screen.getByTestId('index-name-display')
    fireEvent.click(indexNameDisplay)

    const errorText = screen.getByText(errorMsg)
    expect(errorText).toBeInTheDocument()
  })

  it('should not confirm when draft has a validation error', () => {
    const errorMsg = 'An index with this name already exists.'
    mockUseIndexNameValidation.mockReturnValue(errorMsg)
    const onNameChange = jest.fn()
    renderComponent({ onNameChange })

    const indexNameDisplay = screen.getByTestId('index-name-display')
    fireEvent.click(indexNameDisplay)

    const confirmBtn = screen.getByTestId('index-name-confirm-btn')
    fireEvent.click(confirmBtn)

    const editInput = screen.getByTestId('index-name-edit-input')

    expect(onNameChange).not.toHaveBeenCalled()
    expect(editInput).toBeInTheDocument()
  })

  it('should not confirm on Enter key when draft has a validation error', () => {
    const errorMsg = 'Index name is required.'
    mockUseIndexNameValidation.mockReturnValue(errorMsg)
    const onNameChange = jest.fn()
    renderComponent({ onNameChange })

    const indexNameDisplay = screen.getByTestId('index-name-display')
    fireEvent.click(indexNameDisplay)

    const editInput = screen.getByTestId('index-name-edit-input')
    fireEvent.keyDown(editInput, { key: 'Enter' })

    expect(onNameChange).not.toHaveBeenCalled()
    expect(editInput).toBeInTheDocument()
  })

  it('should disable confirm button when draft has a validation error', () => {
    mockUseIndexNameValidation.mockReturnValue('Index name is required.')
    renderComponent()

    const indexNameDisplay = screen.getByTestId('index-name-display')
    fireEvent.click(indexNameDisplay)

    const confirmBtn = screen.getByTestId('index-name-confirm-btn')
    expect(confirmBtn).toBeDisabled()
  })

  it('should show error icon when validationError is provided', () => {
    const errorMsg = 'An index with this name already exists.'
    renderComponent({ validationError: errorMsg })

    const errorIcon = screen.getByTestId('index-name-error-icon')
    expect(errorIcon).toBeInTheDocument()
  })

  it('should not show error icon when validationError is null', () => {
    renderComponent({ validationError: null })

    const errorIcon = screen.queryByTestId('index-name-error-icon')
    expect(errorIcon).not.toBeInTheDocument()
  })
})
