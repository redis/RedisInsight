import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { AddKeyArray, Props } from './ArrayAddElementForm'

jest.mock('uiSrc/slices/browser/array', () => ({
  ...jest.requireActual('uiSrc/slices/browser/array'),
  addArrayElementsStateSelector: jest
    .fn()
    .mockReturnValue({ loading: false, error: '' }),
}))

const defaultProps: Props = {
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
}

const renderComponent = (propsOverride?: Partial<Props>) =>
  render(<AddKeyArray {...defaultProps} {...propsOverride} />)

describe('ArrayAddElementForm (AddKeyArray)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // ActionFooter renders via a portal; create the anchor if needed
    if (!document.getElementById('formFooterBar')) {
      const footer = document.createElement('div')
      footer.setAttribute('id', 'formFooterBar')
      document.body.appendChild(footer)
    }
  })

  afterEach(() => {
    document.getElementById('formFooterBar')?.remove()
  })

  it('should render the form', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render index and value inputs for the initial row', () => {
    renderComponent()
    expect(screen.getByTestId('array-element-index-0')).toBeInTheDocument()
    expect(screen.getByTestId('array-element-value-0')).toBeInTheDocument()
  })

  it('should render Save and Cancel buttons', () => {
    renderComponent()
    expect(screen.getByTestId('array-add-element-btn')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-array-elements-btn')).toBeInTheDocument()
  })

  it('should disable Save when index field is empty', () => {
    renderComponent()
    expect(screen.getByTestId('array-add-element-btn')).toBeDisabled()
  })

  it('should disable Save when index is not a number', () => {
    renderComponent()

    fireEvent.change(screen.getByTestId('array-element-index-0'), {
      target: { value: 'abc' },
    })

    expect(screen.getByTestId('array-add-element-btn')).toBeDisabled()
  })

  it('should disable Save when index is negative', () => {
    renderComponent()

    fireEvent.change(screen.getByTestId('array-element-index-0'), {
      target: { value: '-1' },
    })

    expect(screen.getByTestId('array-add-element-btn')).toBeDisabled()
  })

  it('should disable Save when index is a decimal number', () => {
    renderComponent()

    fireEvent.change(screen.getByTestId('array-element-index-0'), {
      target: { value: '1.5' },
    })

    expect(screen.getByTestId('array-add-element-btn')).toBeDisabled()
  })

  it('should enable Save when a valid non-negative index is entered', () => {
    renderComponent()

    fireEvent.change(screen.getByTestId('array-element-index-0'), {
      target: { value: '0' },
    })

    expect(screen.getByTestId('array-add-element-btn')).not.toBeDisabled()
  })

  it('should call onSubmit with correct data when form is submitted', () => {
    const onSubmit = jest.fn()
    renderComponent({ onSubmit })

    fireEvent.change(screen.getByTestId('array-element-index-0'), {
      target: { value: '2' },
    })
    fireEvent.change(screen.getByTestId('array-element-value-0'), {
      target: { value: 'hello' },
    })

    fireEvent.click(screen.getByTestId('array-add-element-btn'))

    expect(onSubmit).toHaveBeenCalledWith([{ index: 2, value: 'hello' }])
  })

  it('should call onCancel when Cancel is clicked', () => {
    const onCancel = jest.fn()
    renderComponent({ onCancel })

    fireEvent.click(screen.getByTestId('cancel-array-elements-btn'))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should add a second row when clicking add another element', () => {
    renderComponent()

    // Set a valid index to ensure there are no hidden validations on add-field
    fireEvent.change(screen.getByTestId('array-element-index-0'), {
      target: { value: '0' },
    })

    // The add-field button is rendered inside AddMultipleFields
    const addBtn = screen.getByTestId('add-item')
    fireEvent.click(addBtn)

    expect(screen.getByTestId('array-element-index-1')).toBeInTheDocument()
    expect(screen.getByTestId('array-element-value-1')).toBeInTheDocument()
  })

  it('should submit all rows when multiple elements are added', () => {
    const onSubmit = jest.fn()
    renderComponent({ onSubmit })

    // Fill first row
    fireEvent.change(screen.getByTestId('array-element-index-0'), {
      target: { value: '0' },
    })
    fireEvent.change(screen.getByTestId('array-element-value-0'), {
      target: { value: 'first' },
    })

    // Add second row
    fireEvent.click(screen.getByTestId('add-item'))

    // Fill second row (index auto-increments to 1, but may need explicit set)
    fireEvent.change(screen.getByTestId('array-element-index-1'), {
      target: { value: '1' },
    })
    fireEvent.change(screen.getByTestId('array-element-value-1'), {
      target: { value: 'second' },
    })

    fireEvent.click(screen.getByTestId('array-add-element-btn'))

    expect(onSubmit).toHaveBeenCalledWith([
      { index: 0, value: 'first' },
      { index: 1, value: 'second' },
    ])
  })
})
