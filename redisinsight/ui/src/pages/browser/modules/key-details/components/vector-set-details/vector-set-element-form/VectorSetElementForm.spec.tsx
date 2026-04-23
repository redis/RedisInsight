import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import {
  FP32_INVALID_BYTE_LENGTH_INPUT,
  FP32_VECTOR_FIXTURE_1_2_3,
} from 'uiSrc/mocks/factories/browser/vectorSet/vectorSetElement.factory'
import VectorSetElementForm from './VectorSetElementForm'
import { Props } from './interfaces'

const ELEMENT_NAME = 'element-name'
const ELEMENT_VECTOR = 'element-vector'

const defaultProps: Props = {
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  loading: false,
}

describe('VectorSetElementForm', () => {
  it('should render', () => {
    expect(render(<VectorSetElementForm {...defaultProps} />)).toBeTruthy()
  })

  it('should render element name and vector inputs', () => {
    render(<VectorSetElementForm {...defaultProps} />)

    expect(screen.getByTestId(ELEMENT_NAME)).toBeInTheDocument()
    expect(screen.getByTestId(ELEMENT_VECTOR)).toBeInTheDocument()
  })

  it('should set element name value', () => {
    render(<VectorSetElementForm {...defaultProps} />)
    const nameInput = screen.getByTestId(ELEMENT_NAME)
    fireEvent.change(nameInput, { target: { value: 'my-element' } })
    expect(nameInput).toHaveValue('my-element')
  })

  it('should set vector value', () => {
    render(<VectorSetElementForm {...defaultProps} />)
    const vectorInput = screen.getByTestId(ELEMENT_VECTOR)
    fireEvent.change(vectorInput, { target: { value: '0.1, 0.2, 0.3' } })
    expect(vectorInput).toHaveValue('0.1, 0.2, 0.3')
  })

  it('should have save button disabled when form is empty', () => {
    render(<VectorSetElementForm {...defaultProps} />)
    expect(screen.getByTestId('save-elements-btn')).toBeDisabled()
  })

  it('should have save button disabled when only name is filled', () => {
    render(<VectorSetElementForm {...defaultProps} />)
    fireEvent.change(screen.getByTestId(ELEMENT_NAME), {
      target: { value: 'test' },
    })
    expect(screen.getByTestId('save-elements-btn')).toBeDisabled()
  })

  it('should have save button disabled when only vector is filled', () => {
    render(<VectorSetElementForm {...defaultProps} />)
    fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
      target: { value: '0.1, 0.2' },
    })
    expect(screen.getByTestId('save-elements-btn')).toBeDisabled()
  })

  it('should enable save button when name and valid vector are filled', () => {
    render(<VectorSetElementForm {...defaultProps} />)
    fireEvent.change(screen.getByTestId(ELEMENT_NAME), {
      target: { value: 'elem1' },
    })
    fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
      target: { value: '0.1, 0.2, 0.3' },
    })
    expect(screen.getByTestId('save-elements-btn')).not.toBeDisabled()
  })

  it('should show validation error for invalid vector format', () => {
    render(<VectorSetElementForm {...defaultProps} />)
    fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
      target: { value: '0.1, abc, 0.3' },
    })
    expect(
      screen.getAllByText('Invalid number format in vector').length,
    ).toBeGreaterThan(0)
  })

  it('should show validation error for dimension mismatch', () => {
    render(<VectorSetElementForm {...defaultProps} vectorDim={3} />)
    fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
      target: { value: '0.1, 0.2' },
    })
    expect(
      screen.getAllByText(
        'Dimension mismatch. Expected 3 values, but received 2',
      ).length,
    ).toBeGreaterThan(0)
  })

  it('should not show validation error for correct dimensions', () => {
    render(<VectorSetElementForm {...defaultProps} vectorDim={3} />)
    fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
      target: { value: '0.1, 0.2, 0.3' },
    })
    expect(screen.queryByText(/dimension mismatch/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/invalid number format/i)).not.toBeInTheDocument()
  })

  it('should add another element row when clicking add item', () => {
    render(<VectorSetElementForm {...defaultProps} />)
    fireEvent.click(screen.getByTestId('add-item'))

    expect(screen.getAllByTestId(ELEMENT_NAME)).toHaveLength(2)
    expect(screen.getAllByTestId(ELEMENT_VECTOR)).toHaveLength(2)
  })

  it('should clear element values when clicking remove with single row', () => {
    render(<VectorSetElementForm {...defaultProps} />)
    const nameInput = screen.getByTestId(ELEMENT_NAME)
    const vectorInput = screen.getByTestId(ELEMENT_VECTOR)

    fireEvent.change(nameInput, { target: { value: 'test' } })
    fireEvent.change(vectorInput, { target: { value: '0.1, 0.2' } })
    fireEvent.click(screen.getByTestId('remove-item'))

    expect(nameInput).toHaveValue('')
    expect(vectorInput).toHaveValue('')
  })

  it('should toggle attributes section', () => {
    render(<VectorSetElementForm {...defaultProps} />)

    expect(screen.queryByTestId('element-attributes')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('toggle-attributes-btn'))
    expect(screen.getByTestId('element-attributes')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('toggle-attributes-btn'))
    expect(screen.queryByTestId('element-attributes')).not.toBeInTheDocument()
  })

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = jest.fn()
    render(<VectorSetElementForm {...defaultProps} onCancel={onCancel} />)
    fireEvent.click(screen.getByTestId('cancel-elements-btn'))
    expect(onCancel).toHaveBeenCalledWith(true)
  })

  it('should call onSubmit with parsed elements when save is clicked', () => {
    const onSubmit = jest.fn()
    render(<VectorSetElementForm {...defaultProps} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByTestId(ELEMENT_NAME), {
      target: { value: 'elem1' },
    })
    fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
      target: { value: '0.1, 0.2, 0.3' },
    })
    fireEvent.click(screen.getByTestId('save-elements-btn'))

    expect(onSubmit).toHaveBeenCalledWith([
      { name: 'elem1', vectorValues: [0.1, 0.2, 0.3] },
    ])
  })

  it('should include attributes in submit data when provided', () => {
    const onSubmit = jest.fn()
    render(<VectorSetElementForm {...defaultProps} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByTestId(ELEMENT_NAME), {
      target: { value: 'elem1' },
    })
    fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
      target: { value: '1, 2, 3' },
    })
    fireEvent.click(screen.getByTestId('toggle-attributes-btn'))
    fireEvent.change(screen.getByTestId('element-attributes'), {
      target: { value: '{"key":"value"}' },
    })
    fireEvent.click(screen.getByTestId('save-elements-btn'))

    expect(onSubmit).toHaveBeenCalledWith([
      {
        name: 'elem1',
        vectorValues: [1, 2, 3],
        attributes: '{"key":"value"}',
      },
    ])
  })

  it('should use custom submit text', () => {
    render(<VectorSetElementForm {...defaultProps} submitText="Add Key" />)
    expect(screen.getByTestId('save-elements-btn')).toHaveTextContent('Add Key')
  })

  it('should disable inputs when loading', () => {
    render(<VectorSetElementForm {...defaultProps} loading />)
    expect(screen.getByTestId(ELEMENT_NAME)).toBeDisabled()
    expect(screen.getByTestId(ELEMENT_VECTOR)).toBeDisabled()
  })

  it('should show vector dimension hint in placeholder when vectorDim is provided', () => {
    render(<VectorSetElementForm {...defaultProps} vectorDim={5} />)
    expect(screen.getByTestId(ELEMENT_VECTOR)).toHaveAttribute(
      'placeholder',
      'Enter Vector (5 dimensions)',
    )
  })

  describe('FP32 input', () => {
    const { escaped: FP32_ESCAPED, base64: FP32_BASE64 } =
      FP32_VECTOR_FIXTURE_1_2_3

    it('should show the FP32 detected hint for a valid escaped-byte input', () => {
      render(<VectorSetElementForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
        target: { value: FP32_ESCAPED },
      })
      expect(
        screen.getByText('Detected FP32 vector (3 dimensions).'),
      ).toBeInTheDocument()
    })

    it('should submit a vectorFp32 payload instead of vectorValues', () => {
      const onSubmit = jest.fn()
      render(<VectorSetElementForm {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.change(screen.getByTestId(ELEMENT_NAME), {
        target: { value: 'elem1' },
      })
      fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
        target: { value: FP32_ESCAPED },
      })
      fireEvent.click(screen.getByTestId('save-elements-btn'))

      expect(onSubmit).toHaveBeenCalledWith([
        { name: 'elem1', vectorFp32: FP32_BASE64 },
      ])
    })

    it('should flag an FP32 input whose byte length is not a multiple of 4', () => {
      render(<VectorSetElementForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
        target: { value: FP32_INVALID_BYTE_LENGTH_INPUT },
      })
      expect(
        screen.getAllByText('FP32 byte length must be a multiple of 4').length,
      ).toBeGreaterThan(0)
    })

    it('should infer required dim from a FP32 first element for a numeric second row', () => {
      render(<VectorSetElementForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId(ELEMENT_NAME), {
        target: { value: 'elem1' },
      })
      fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
        target: { value: FP32_ESCAPED },
      })

      fireEvent.click(screen.getByTestId('add-item'))

      const vectorInputs = screen.getAllByTestId(ELEMENT_VECTOR)
      expect(vectorInputs[1]).toHaveAttribute(
        'placeholder',
        'Enter Vector (3 dimensions)',
      )
    })
  })

  describe('when vectorDim is not provided (new vector set)', () => {
    it('should infer required dimension from the first element vector', () => {
      render(<VectorSetElementForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId(ELEMENT_NAME), {
        target: { value: 'elem1' },
      })
      fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
        target: { value: '0.1, 0.2, 0.3' },
      })

      fireEvent.click(screen.getByTestId('add-item'))

      const vectorInputs = screen.getAllByTestId(ELEMENT_VECTOR)
      expect(vectorInputs[1]).toHaveAttribute(
        'placeholder',
        'Enter Vector (3 dimensions)',
      )
    })

    it('should show dimension mismatch error on subsequent element that does not match the first', () => {
      render(<VectorSetElementForm {...defaultProps} />)

      fireEvent.change(screen.getByTestId(ELEMENT_NAME), {
        target: { value: 'elem1' },
      })
      fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
        target: { value: '0.1, 0.2, 0.3' },
      })

      fireEvent.click(screen.getByTestId('add-item'))

      const nameInputs = screen.getAllByTestId(ELEMENT_NAME)
      const vectorInputs = screen.getAllByTestId(ELEMENT_VECTOR)

      fireEvent.change(nameInputs[1], { target: { value: 'elem2' } })
      fireEvent.change(vectorInputs[1], { target: { value: '0.4, 0.5' } })

      expect(
        screen.getAllByText(
          'Dimension mismatch. Expected 3 values, but received 2',
        ).length,
      ).toBeGreaterThan(0)
      expect(screen.getByTestId('save-elements-btn')).toBeDisabled()
    })

    it('should not validate the first element against an inferred dimension from itself', () => {
      render(<VectorSetElementForm {...defaultProps} />)
      fireEvent.change(screen.getByTestId(ELEMENT_NAME), {
        target: { value: 'elem1' },
      })
      fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
        target: { value: '0.1, 0.2, 0.3' },
      })

      expect(screen.queryByText(/dimension mismatch/i)).not.toBeInTheDocument()
      expect(screen.getByTestId('save-elements-btn')).not.toBeDisabled()
    })

    it('should enable save when all subsequent elements match the first element dimension', () => {
      render(<VectorSetElementForm {...defaultProps} />)

      fireEvent.change(screen.getByTestId(ELEMENT_NAME), {
        target: { value: 'elem1' },
      })
      fireEvent.change(screen.getByTestId(ELEMENT_VECTOR), {
        target: { value: '1, 2, 3' },
      })

      fireEvent.click(screen.getByTestId('add-item'))

      const nameInputs = screen.getAllByTestId(ELEMENT_NAME)
      const vectorInputs = screen.getAllByTestId(ELEMENT_VECTOR)

      fireEvent.change(nameInputs[1], { target: { value: 'elem2' } })
      fireEvent.change(vectorInputs[1], { target: { value: '4, 5, 6' } })

      expect(screen.queryByText(/dimension mismatch/i)).not.toBeInTheDocument()
      expect(screen.getByTestId('save-elements-btn')).not.toBeDisabled()
    })
  })
})
