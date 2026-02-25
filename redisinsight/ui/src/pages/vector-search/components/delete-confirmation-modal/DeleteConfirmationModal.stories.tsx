import type { Meta, StoryObj } from '@storybook/react-vite'

import { DeleteConfirmationModal } from './DeleteConfirmationModal'

const meta: Meta<typeof DeleteConfirmationModal> = {
  component: DeleteConfirmationModal,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Reusable confirmation modal for destructive actions such as deleting an index or a saved query. All text, labels, and callbacks are configurable via props.',
      },
    },
  },
  argTypes: {
    isOpen: {
      description: 'Controls whether the modal is visible.',
      control: 'boolean',
    },
    title: {
      description: 'Modal heading text.',
      control: 'text',
    },
    question: {
      description: 'Secondary-colored question shown below the title.',
      control: 'text',
    },
    message: {
      description: 'Bold primary-colored message explaining consequences.',
      control: 'text',
    },
    cancelLabel: {
      description: 'Label for the secondary cancel button.',
      control: 'text',
    },
    confirmLabel: {
      description: 'Label for the destructive confirm button.',
      control: 'text',
    },
    testId: {
      description: 'Prefix for data-testid attributes.',
      control: 'text',
    },
    onConfirm: {
      description: 'Called when the confirm button is clicked.',
      action: 'onConfirm',
    },
    onCancel: {
      description:
        'Called when cancel button, close icon, or backdrop is clicked.',
      action: 'onCancel',
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const DeleteIndex: Story = {
  args: {
    isOpen: true,
    title: 'Delete Index',
    question: 'Are you sure you want to delete this index?',
    message:
      'Deleting the index will remove it from Search and Vector Search, but will not delete your underlying data.',
    cancelLabel: 'Keep index',
    confirmLabel: 'Delete index',
    testId: 'delete-index-modal',
  },
  parameters: {
    docs: {
      description: {
        story: 'Used when confirming deletion of a search index.',
      },
    },
  },
}

export const DeleteQuery: Story = {
  args: {
    isOpen: true,
    title: 'Delete query',
    question: 'Are you sure you want to delete this query?',
    message:
      "This action will remove the saved query, but won't affect your index or data.",
    cancelLabel: 'Keep query',
    confirmLabel: 'Delete query',
    testId: 'query-library-delete-modal',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Used when confirming deletion of a saved query from the library.',
      },
    },
  },
}
