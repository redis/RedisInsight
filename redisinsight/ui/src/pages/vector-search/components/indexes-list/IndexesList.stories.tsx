import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { Col } from 'uiSrc/components/base/layout/flex'
import {
  indexListRowFactory,
  mockIndexListData,
} from 'uiSrc/mocks/factories/vector-search/indexList.factory'
import IndexesList from './IndexesList'
import { IndexesListProps, IndexListAction } from './IndexesList.types'

// Simple wrapper for stories
const IndexesListWrapper = (props: IndexesListProps) => (
  <Col style={{ maxWidth: '1200px' }}>
    <IndexesList {...props} />
  </Col>
)

const meta: Meta<typeof IndexesList> = {
  component: IndexesList,
  tags: ['autodocs'],
  render: (args) => <IndexesListWrapper {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          'Table of vector search indexes. Pass `onQueryClick` and `actions` to handle the Query button and the row actions menu (e.g. Edit, Delete). Column headers for Index prefix, Docs, Records, Terms, and Fields show an info icon; hover or focus the icon to see a tooltip.',
      },
    },
  },
  argTypes: {
    loading: {
      description:
        'When true, empty state shows "Loading..." instead of "No indexes found".',
      control: 'boolean',
    },
    onQueryClick: {
      description:
        'Called with the index name when the Query button is clicked.',
      action: 'onQueryClick',
    },
    actions: {
      description:
        'Array of { name, callback } for menu items. callback receives the index name.',
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: mockIndexListData,
  },
}

export const Empty: Story = {
  args: {
    data: [],
  },
}

export const Loading: Story = {
  args: {
    data: [],
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Empty list while loading. The table shows "Loading..." in the empty state.',
      },
    },
  },
}

export const SingleIndex: Story = {
  args: {
    data: [mockIndexListData[0]],
  },
}

export const ManyIndexes: Story = {
  args: {
    data: indexListRowFactory.buildList(20),
  },
}

export const AllFieldTypes: Story = {
  args: {
    data: [
      indexListRowFactory.build({
        fieldTypes: [
          FieldTypes.TEXT,
          FieldTypes.TAG,
          FieldTypes.NUMERIC,
          FieldTypes.GEO,
          FieldTypes.VECTOR,
        ],
      }),
    ],
  },
}

export const LongNames: Story = {
  args: {
    data: [
      indexListRowFactory.build({
        name: 'this-is-a-very-long-index-name-that-should-be-truncated-in-the-ui',
        prefixes: [
          'prefix-one:',
          'prefix-two:',
          'prefix-three:',
          'prefix-four:',
        ],
      }),
    ],
  },
}

export const NoPrefixes: Story = {
  args: {
    data: [
      indexListRowFactory.build({
        prefixes: [],
      }),
    ],
  },
}

export const ZeroDocuments: Story = {
  args: {
    data: [
      indexListRowFactory.build({
        numDocs: 0,
        numRecords: 0,
        numTerms: 0,
      }),
    ],
  },
}

/**
 * Custom `onQueryClick` and `actions` are passed. Use the Actions panel to see
 * callbacks when you click Query or open the menu and choose Edit or Delete.
 */
export const WithActionsCallbacks: Story = {
  args: {
    data: mockIndexListData,
    onQueryClick: (_indexName: string) => {},
    actions: [
      {
        name: 'Edit',
        callback: (_indexName: string) => {
          // eslint-disable-next-line no-console
          console.log('Edit')
        },
      },
      {
        name: 'Delete',
        callback: (_indexName: string) => {
          // eslint-disable-next-line no-console
          console.log('Delete')
        },
      },
    ] satisfies IndexListAction[],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pass `onQueryClick` and `actions` to handle row actions. Check the Actions panel when clicking Query (if connected) or menu items.',
      },
    },
  },
}
