import type { Meta, StoryObj } from '@storybook/react-vite'

import {
  indexInfoFactory,
  indexAttributeFactory,
} from 'uiSrc/mocks/factories/vector-search/indexInfo.factory'

import { IndexInfo } from './index'

const meta: Meta<typeof IndexInfo> = {
  component: IndexInfo,
  tags: ['autodocs'],
  argTypes: {
    indexInfo: {
      description: 'The index information object',
    },
    dataTestId: {
      description: 'Custom data-testid prefix for testing',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Simple default story
export const Default: Story = {
  args: {
    indexInfo: indexInfoFactory.build(),
  },
}

// HASH index type
export const HashIndex: Story = {
  name: 'HASH index',
  args: {
    indexInfo: indexInfoFactory.build({
      indexDefinition: {
        keyType: 'HASH',
        prefixes: ['bike:'],
      },
      attributes: [
        indexAttributeFactory.build({
          identifier: 'brand',
          attribute: 'brand',
          type: 'text',
          weight: '1',
        }),
        indexAttributeFactory.build({
          identifier: 'model',
          attribute: 'model',
          type: 'text',
          weight: '1',
        }),
        indexAttributeFactory.build({
          identifier: 'price',
          attribute: 'price',
          type: 'numeric',
        }),
        indexAttributeFactory.build({
          identifier: 'condition',
          attribute: 'condition',
          type: 'tag',
        }),
      ],
    }),
  },
}

// JSON index type with $.path notation
export const JsonIndex: Story = {
  name: 'JSON index',
  args: {
    indexInfo: indexInfoFactory.build({
      indexDefinition: {
        keyType: 'JSON',
        prefixes: ['json:bikes:'],
      },
      attributes: [
        indexAttributeFactory.build({
          identifier: '$.name',
          attribute: 'name',
          type: 'text',
          weight: '1',
        }),
        indexAttributeFactory.build({
          identifier: '$.category',
          attribute: 'category',
          type: 'tag',
        }),
        indexAttributeFactory.build({
          identifier: '$.price',
          attribute: 'price',
          type: 'numeric',
        }),
      ],
    }),
  },
}

// With filter and language options
export const WithOptions: Story = {
  name: 'With options',
  args: {
    indexInfo: indexInfoFactory.build({
      indexDefinition: {
        keyType: 'HASH',
        prefixes: ['product:'],
      },
      indexOptions: {
        filter: '@status == "active"',
        defaultLang: 'german',
      },
      attributes: [
        indexAttributeFactory.build({
          identifier: 'name',
          attribute: 'name',
          type: 'text',
        }),
        indexAttributeFactory.build({
          identifier: 'status',
          attribute: 'status',
          type: 'tag',
        }),
      ],
    }),
  },
}

// Empty attributes
export const EmptyState: Story = {
  name: 'Empty state',
  args: {
    indexInfo: indexInfoFactory.build({
      attributes: [],
    }),
  },
}

// Loading state
export const Loading: Story = {
  name: 'Loading state',
  args: {
    indexInfo: undefined,
  },
}
