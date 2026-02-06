import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { Col } from 'uiSrc/components/base/layout/flex'
import { indexListRowFactory } from 'uiSrc/mocks/factories/vector-search/IndexListRow.factory'
import IndexesList from './IndexesList'
import { IndexListRow, IndexesListProps } from './IndexesList.types'

const handleQueryClick = (indexName: string) => {
  // eslint-disable-next-line no-alert
  alert(`Query clicked for index: ${indexName}`)
}

const sampleData: IndexListRow[] = [
  {
    id: 'idx-1',
    name: 'products-idx',
    prefixes: ['product:'],
    fieldTypes: [FieldTypes.TEXT, FieldTypes.TAG, FieldTypes.NUMERIC],
    numDocs: 15420,
    numRecords: 45260,
    numTerms: 8500,
    numFields: 3,
  },
  {
    id: 'idx-2',
    name: 'users-idx',
    prefixes: ['user:', 'account:'],
    fieldTypes: [FieldTypes.TEXT, FieldTypes.VECTOR],
    numDocs: 8500,
    numRecords: 17000,
    numTerms: 3200,
    numFields: 2,
  },
  {
    id: 'idx-3',
    name: 'locations-idx',
    prefixes: ['loc:'],
    fieldTypes: [FieldTypes.GEO, FieldTypes.TEXT],
    numDocs: 2000,
    numRecords: 4000,
    numTerms: 1500,
    numFields: 2,
  },
]

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
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    data: sampleData,
    onQueryClick: handleQueryClick,
  },
}

export const Loading: Story = {
  args: {
    data: [],
    loading: true,
    onQueryClick: handleQueryClick,
  },
}

export const Empty: Story = {
  args: {
    data: [],
    loading: false,
    onQueryClick: handleQueryClick,
  },
}

export const SingleIndex: Story = {
  args: {
    data: [sampleData[0]],
    onQueryClick: handleQueryClick,
  },
}

export const ManyIndexes: Story = {
  args: {
    data: indexListRowFactory.buildList(20),
    onQueryClick: handleQueryClick,
  },
}

export const AllFieldTypes: Story = {
  args: {
    data: [
      {
        id: 'all-types',
        name: 'all-types-idx',
        prefixes: ['all:'],
        fieldTypes: [
          FieldTypes.TEXT,
          FieldTypes.TAG,
          FieldTypes.NUMERIC,
          FieldTypes.GEO,
          FieldTypes.VECTOR,
          FieldTypes.GEOSHAPE,
        ],
        numDocs: 999999,
        numRecords: 2999997,
        numTerms: 500000,
        numFields: 6,
      },
    ],
    onQueryClick: handleQueryClick,
  },
}

export const LongNames: Story = {
  args: {
    data: [
      {
        id: 'long-name',
        name: 'this-is-a-very-long-index-name-that-should-be-truncated-in-the-ui',
        prefixes: [
          'prefix-one:',
          'prefix-two:',
          'prefix-three:',
          'prefix-four:',
        ],
        fieldTypes: [FieldTypes.TEXT, FieldTypes.TAG, FieldTypes.VECTOR],
        numDocs: 1234567,
        numRecords: 3703701,
        numTerms: 250000,
        numFields: 3,
      },
    ],
    onQueryClick: handleQueryClick,
  },
}

export const NoPrefixes: Story = {
  args: {
    data: [
      {
        id: 'no-prefix',
        name: 'global-index',
        prefixes: [],
        fieldTypes: [FieldTypes.TEXT, FieldTypes.VECTOR],
        numDocs: 50000,
        numRecords: 100000,
        numTerms: 25000,
        numFields: 2,
      },
    ],
    onQueryClick: handleQueryClick,
  },
}

export const ZeroDocuments: Story = {
  args: {
    data: [
      {
        id: 'zero-docs',
        name: 'empty-index',
        prefixes: ['empty:'],
        fieldTypes: [FieldTypes.TEXT],
        numDocs: 0,
        numRecords: 0,
        numTerms: 0,
        numFields: 1,
      },
    ],
    onQueryClick: handleQueryClick,
  },
}
