import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { ViewIndexDataButton } from './ViewIndexDataButton'

const meta: Meta<typeof ViewIndexDataButton> = {
  component: ViewIndexDataButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Navigates from a key to its search index query page. Adapts UI based on index count: disabled placeholder (0), text button (1), or dropdown menu (2+).',
      },
    },
  },
  args: {
    instanceId: 'test-instance',
    onNavigate: fn(),
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const NoIndexes: Story = {
  args: {
    indexes: [],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Key belongs to no indexes. Shows a disabled placeholder button.',
      },
    },
  },
}

export const SingleIndex: Story = {
  args: {
    indexes: [
      { name: 'products_index', prefixes: ['product:'], keyType: 'HASH' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Key belongs to one index. Shows a text button that navigates directly.',
      },
    },
  },
}

export const MultipleIndexes: Story = {
  args: {
    indexes: [
      { name: 'products_index', prefixes: ['product:'], keyType: 'HASH' },
      { name: 'users_index', prefixes: ['user:'], keyType: 'HASH' },
      { name: 'id_index', prefixes: ['id:'], keyType: 'JSON' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Key belongs to multiple indexes. Shows a dropdown with count badge and chevron.',
      },
    },
  },
}

export const ManyIndexes: Story = {
  args: {
    indexes: Array.from({ length: 12 }, (_, i) => ({
      name: `index_${i + 1}`,
      prefixes: [`prefix${i + 1}:`],
      keyType: 'HASH',
    })),
  },
  parameters: {
    docs: {
      description: {
        story: 'Key belongs to many indexes. Badge shows double-digit count.',
      },
    },
  },
}
