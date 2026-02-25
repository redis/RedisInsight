import React from 'react'
import { act } from 'react-dom/test-utils'
import { faker } from '@faker-js/faker'
import { render, screen, fireEvent, waitFor } from 'uiSrc/utils/test-utils'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import {
  IndexField,
  VectorAlgorithm,
  VectorDistanceMetric,
} from '../index-details/IndexDetails.types'
import { FieldTypeModal } from './FieldTypeModal'
import { FieldTypeModalMode, FieldTypeModalProps } from './FieldTypeModal.types'

const mockOnSubmit = jest.fn()
const mockOnClose = jest.fn()

const existingFields: IndexField[] = [
  {
    id: 'title',
    name: 'title',
    value: faker.lorem.words(3),
    type: FieldTypes.TEXT,
  },
  {
    id: 'embedding',
    name: 'embedding',
    value: '[0.1, 0.2]',
    type: FieldTypes.VECTOR,
    options: {
      algorithm: VectorAlgorithm.HNSW,
      dimensions: 768,
      distanceMetric: VectorDistanceMetric.COSINE,
    },
  },
]

const defaultProps: FieldTypeModalProps = {
  isOpen: true,
  mode: FieldTypeModalMode.Create,
  fields: existingFields,
  onSubmit: mockOnSubmit,
  onClose: mockOnClose,
}

const renderComponent = async (
  propsOverride?: Partial<FieldTypeModalProps>,
) => {
  const props = { ...defaultProps, ...propsOverride }

  let result: ReturnType<typeof render>
  await act(async () => {
    result = render(<FieldTypeModal {...props} />)
  })

  return result!
}

describe('FieldTypeModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render nothing when isOpen is false', async () => {
    await renderComponent({ isOpen: false })

    expect(
      screen.queryByTestId('field-type-modal-form'),
    ).not.toBeInTheDocument()
  })

  it('should render modal in create mode with field name input', async () => {
    await renderComponent()

    expect(
      screen.getByTestId('field-type-modal-field-name'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('field-type-modal-save')).toBeInTheDocument()
    expect(screen.getByTestId('field-type-modal-cancel')).toBeInTheDocument()
  })

  it('should render modal in edit mode with readonly field info', async () => {
    await renderComponent({
      mode: FieldTypeModalMode.Edit,
      field: existingFields[0],
    })

    expect(
      screen.getByTestId('field-type-modal-field-name-readonly'),
    ).toBeInTheDocument()
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(
      screen.queryByTestId('field-type-modal-field-name'),
    ).not.toBeInTheDocument()
  })

  it('should disable Add button when field name is empty in create mode', async () => {
    await renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('field-type-modal-save')).toBeDisabled()
    })
  })

  it('should call onClose when Cancel button is clicked', async () => {
    await renderComponent()

    fireEvent.click(screen.getByTestId('field-type-modal-cancel'))

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should show Add button text in create mode and Save in edit mode', async () => {
    const { unmount } = await renderComponent()
    expect(screen.getByTestId('field-type-modal-save')).toHaveTextContent('Add')
    unmount()

    await renderComponent({
      mode: FieldTypeModalMode.Edit,
      field: existingFields[0],
    })
    expect(screen.getByTestId('field-type-modal-save')).toHaveTextContent(
      'Save',
    )
  })

  it('should show description text', async () => {
    await renderComponent()

    expect(
      screen.getByText(/You can change the field type/),
    ).toBeInTheDocument()
  })

  it('should render section header for TEXT type by default', async () => {
    await renderComponent()

    expect(
      screen.getByTestId('field-type-modal-section-header'),
    ).toHaveTextContent('TEXT options')
  })

  it('should enable Add button after entering a valid field name', async () => {
    await renderComponent()

    const input = screen.getByTestId('field-type-modal-field-name')
    fireEvent.change(input, { target: { value: 'newField' } })

    await waitFor(() => {
      expect(screen.getByTestId('field-type-modal-save')).not.toBeDisabled()
    })
  })

  it('should show sample value in edit mode', async () => {
    const field = { ...existingFields[0], value: 'sample text' }
    await renderComponent({
      mode: FieldTypeModalMode.Edit,
      field,
    })

    expect(
      screen.getByTestId('field-type-modal-sample-value'),
    ).toBeInTheDocument()
    expect(screen.getByText('sample text')).toBeInTheDocument()
  })
})
