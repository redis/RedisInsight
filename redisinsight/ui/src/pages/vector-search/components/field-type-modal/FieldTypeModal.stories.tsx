import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import {
  IndexField,
  VectorAlgorithm,
  VectorDistanceMetric,
} from '../index-details/IndexDetails.types'
import { FieldTypeModal } from './FieldTypeModal'
import { FieldTypeModalMode, FieldTypeModalProps } from './FieldTypeModal.types'

const sampleVectorField: IndexField = {
  id: 'embedding',
  name: 'embedding',
  value: '[0.12, 0.34, ...]',
  type: FieldTypes.VECTOR,
  options: {
    algorithm: VectorAlgorithm.HNSW,
    dimensions: 768,
    distanceMetric: VectorDistanceMetric.COSINE,
    maxEdges: 16,
    maxNeighbors: 200,
    candidateLimit: 10,
    epsilon: 0.01,
  },
}

const sampleTextField: IndexField = {
  id: 'title',
  name: 'title',
  value: 'Sample product title',
  type: FieldTypes.TEXT,
  options: {
    weight: 2,
    phonetic: 'dm:en',
  },
}

const existingFields: IndexField[] = [sampleVectorField, sampleTextField]

const FieldTypeModalWithState = (
  props: Omit<FieldTypeModalProps, 'isOpen' | 'onSubmit' | 'onClose'>,
) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      {!isOpen && (
        <button type="button" onClick={() => setIsOpen(true)}>
          Open modal
        </button>
      )}
      <FieldTypeModal
        {...props}
        isOpen={isOpen}
        onSubmit={(field) => {
          // eslint-disable-next-line no-console
          console.log('Submitted field:', field)
          setIsOpen(false)
        }}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

const meta: Meta<typeof FieldTypeModal> = {
  component: FieldTypeModal,
  argTypes: {
    isOpen: { description: 'Controls modal visibility' },
    mode: {
      description: 'Create or Edit mode',
      control: 'select',
      options: Object.values(FieldTypeModalMode),
    },
    field: { description: 'Field to edit (edit mode only)' },
    fields: { description: 'Existing fields for duplicate name validation' },
    onSubmit: { description: 'Called with the new/updated IndexField' },
    onClose: { description: 'Called when modal is closed' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const CreateMode: Story = {
  render: () => (
    <FieldTypeModalWithState
      mode={FieldTypeModalMode.Create}
      fields={existingFields}
    />
  ),
}

export const EditVectorField: Story = {
  name: 'Edit — Vector (HNSW)',
  render: () => (
    <FieldTypeModalWithState
      mode={FieldTypeModalMode.Edit}
      field={sampleVectorField}
      fields={existingFields}
    />
  ),
}

export const EditTextField: Story = {
  name: 'Edit — Text',
  render: () => (
    <FieldTypeModalWithState
      mode={FieldTypeModalMode.Edit}
      field={sampleTextField}
      fields={existingFields}
    />
  ),
}
