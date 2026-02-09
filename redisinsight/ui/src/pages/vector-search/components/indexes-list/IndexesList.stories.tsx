import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { Col } from 'uiSrc/components/base/layout/flex'
import {
  indexListRowFactory,
  mockIndexListData,
} from 'uiSrc/mocks/factories/vector-search/indexList.factory'
import IndexesList from './IndexesList'
import { IndexesListProps } from './IndexesList.types'

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
          'Table of vector search indexes. Column headers for Index prefix, Docs, Records, Terms, and Fields show an info icon; hover or focus the icon to see a tooltip with the column description.',
      },
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
          FieldTypes.GEO,
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
 * Column headers for Index prefix, Docs, Records, Terms, and Fields include
 * an info icon. Hover or focus the icon to see a tooltip describing the column.
 */
export const WithColumnTooltips: Story = {
  args: {
    data: mockIndexListData,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use the info icons next to Index prefix, Docs, Records, Terms, and Fields to see tooltips explaining each column.',
      },
    },
  },
}
