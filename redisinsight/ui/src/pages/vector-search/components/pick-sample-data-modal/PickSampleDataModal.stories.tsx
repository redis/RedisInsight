import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { PickSampleDataModal } from './PickSampleDataModal'
import {
  SampleDataContent,
  PickSampleDataModalProps,
} from './PickSampleDataModal.types'

/**
 * Example parent wrapper that demonstrates how to wire the modal
 * with local state. This is the pattern RI-7920 should follow
 * when integrating into the Create Index flow.
 */
const PickSampleDataModalWithState = (
  props: Omit<
    PickSampleDataModalProps,
    'isOpen' | 'selectedDataset' | 'onSelectDataset' | 'onCancel'
  >,
) => {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedDataset, setSelectedDataset] =
    useState<SampleDataContent | null>(null)

  return (
    <>
      {!isOpen && (
        <button type="button" onClick={() => setIsOpen(true)}>
          Open modal
        </button>
      )}
      <PickSampleDataModal
        isOpen={isOpen}
        selectedDataset={selectedDataset}
        onSelectDataset={setSelectedDataset}
        onCancel={() => {
          setIsOpen(false)
          setSelectedDataset(null)
        }}
        onSeeIndexDefinition={(dataset) => {
          // eslint-disable-next-line no-console
          console.log('See index definition for:', dataset)
          props.onSeeIndexDefinition(dataset)
        }}
        onStartQuerying={(dataset) => {
          // eslint-disable-next-line no-console
          console.log('Start querying with:', dataset)
          props.onStartQuerying(dataset)
        }}
      />
    </>
  )
}

const meta: Meta<typeof PickSampleDataModal> = {
  component: PickSampleDataModal,
  argTypes: {
    isOpen: {
      description: 'Controls modal visibility',
    },
    selectedDataset: {
      description: 'Currently selected sample dataset',
      control: 'select',
      options: [null, ...Object.values(SampleDataContent)],
    },
    onSelectDataset: {
      description: 'Called when user selects a dataset option',
    },
    onCancel: {
      description: 'Called when user cancels (Cancel button or X)',
    },
    onSeeIndexDefinition: {
      description: 'Called when user clicks "See index definition"',
    },
    onStartQuerying: {
      description: 'Called when user clicks "Start querying"',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * Interactive example with local state management.
 * This demonstrates how a parent component should wire the modal.
 */
export const Interactive: Story = {
  render: (args) => (
    <PickSampleDataModalWithState
      onSeeIndexDefinition={args.onSeeIndexDefinition}
      onStartQuerying={args.onStartQuerying}
    />
  ),
}

/** Modal with no selection — action buttons are disabled. */
export const NoSelection: Story = {
  args: {
    isOpen: true,
    selectedDataset: null,
  },
}

/** Modal with E-commerce Discovery pre-selected. */
export const EcommerceSelected: Story = {
  name: 'E-commerce Discovery selected',
  args: {
    isOpen: true,
    selectedDataset: SampleDataContent.E_COMMERCE_DISCOVERY,
  },
}

/** Modal with Content Recommendations pre-selected. */
export const ContentRecommendationsSelected: Story = {
  name: 'Content recommendations selected',
  args: {
    isOpen: true,
    selectedDataset: SampleDataContent.CONTENT_RECOMMENDATIONS,
  },
}
