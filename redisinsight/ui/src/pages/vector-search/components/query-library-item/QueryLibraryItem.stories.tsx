import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'
import { MOCK_COMMANDS_SPEC } from 'uiSrc/constants'
import { getRedisCommandsSuccess } from 'uiSrc/slices/app/redis-commands'
import { Col } from 'uiSrc/components/base/layout/flex'
import MonacoEnvironmentInitializer from 'uiSrc/components/MonacoEnvironmentInitializer/MonacoEnvironmentInitializer'
import MonacoLanguages from 'uiSrc/components/monaco-laguages'

import { QueryLibraryItem } from './QueryLibraryItem'
import {
  QueryLibraryItemProps,
  QueryLibraryItemType,
} from './QueryLibraryItem.types'

const withMonacoSetup = (Story: React.ComponentType) => {
  const MonacoSetup = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
      // @ts-ignore
      dispatch(getRedisCommandsSuccess(MOCK_COMMANDS_SPEC))
    }, [dispatch])

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <MonacoEnvironmentInitializer />
        <MonacoLanguages />
        <Story />
      </div>
    )
  }

  return <MonacoSetup />
}

const InteractiveWrapper = (props: QueryLibraryItemProps) => {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <Col style={{ maxWidth: '900px', gap: '8px' }}>
      <QueryLibraryItem
        {...props}
        isOpen={openId === props.id}
        onToggleOpen={(id) => setOpenId((prev) => (prev === id ? null : id))}
      />
    </Col>
  )
}

const MultiItemWrapper = ({ items }: { items: QueryLibraryItemProps[] }) => {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <Col style={{ width: '100%', overflow: 'auto' }}>
      {items.map((item) => (
        <QueryLibraryItem
          key={item.id}
          {...item}
          isOpen={openId === item.id}
          onToggleOpen={(id) => setOpenId((prev) => (prev === id ? null : id))}
        />
      ))}
    </Col>
  )
}

const meta: Meta<typeof QueryLibraryItem> = {
  component: QueryLibraryItem,
  tags: ['autodocs'],
  decorators: [withMonacoSetup],
  parameters: {
    docs: {
      description: {
        component:
          'A reusable Query Library item component with a header (name, description, type badge), action buttons (Run, Load, Delete), and an expandable read-only code preview.',
      },
    },
  },
  argTypes: {
    type: {
      control: 'select',
      options: [QueryLibraryItemType.Sample, QueryLibraryItemType.Saved],
    },
    onRun: { action: 'onRun' },
    onLoad: { action: 'onLoad' },
    onDelete: { action: 'onDelete' },
    onToggleOpen: { action: 'onToggleOpen' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Interactive: Story = {
  name: 'Interactive (click to expand)',
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 350,
      },
    },
  },
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    id: 'interactive-1',
    name: 'Aggregation pipeline',
    description: 'Group bikes by brand and calculate averages',
    type: QueryLibraryItemType.Sample,
    query: `FT.AGGREGATE idx:bikes "*"
  GROUPBY 1 @brand
    REDUCE COUNT 0 AS count
    REDUCE AVG 1 @price AS avg_price
  SORTBY 2 @count DESC
  LIMIT 0 5`,
    onRun: () => {},
    onLoad: () => {},
    onDelete: () => {},
  },
}

export const LongText: Story = {
  name: 'Long name and description (overflow)',
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 350,
      },
    },
  },
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    id: 'long-text-1',
    name: 'This is a very long query name that should be truncated with an ellipsis when it overflows the available space in the header',
    description:
      'This is an equally long description that explains in great detail what this query does including filtering by multiple fields sorting by relevance and returning paginated results with vector similarity scores',
    type: QueryLibraryItemType.Saved,
    query: `FT.SEARCH idx:products
  "(@category:{electronics} @brand:{Samsung|Apple|Sony})
  =>[KNN 10 @embedding $BLOB AS score]"
  PARAMS 2 BLOB "\\x00\\x01\\x02\\x03"
  SORTBY score ASC
  RETURN 5 name brand price category score
  LIMIT 0 20`,
    onRun: () => {},
    onLoad: () => {},
    onDelete: () => {},
  },
}

export const ExtremelyLongName: Story = {
  name: 'Extremely long name (exceeds container)',
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 350,
      },
    },
  },
  render: (args) => <InteractiveWrapper {...args} />,
  args: {
    id: 'extreme-name-1',
    name: [
      'Product catalog aggregation by category and brand',
      'with average price and maximum rating sorted by',
      'count descending and price ascending limited to',
      'top fifty results for the electronics department',
      'including subcategories accessories and refurbished',
      'items filtered by availability region warehouse',
      'stock levels and seasonal promotional discounts',
      'applied to premium membership tiers gold silver',
      'and platinum with loyalty points multiplier active',
      'for the current fiscal quarter ending March',
      'thirty first across all participating retail',
      'locations in North America and Western Europe',
    ].join(' '),
    type: QueryLibraryItemType.Sample,
    query: 'FT.SEARCH idx:products "*" RETURN 1 name',
    onRun: () => {},
    onLoad: () => {},
    onDelete: () => {},
  },
}

export const MultipleItems: Story = {
  name: 'Multiple items (list)',
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: 800,
      },
    },
  },
  render: () => (
    <MultiItemWrapper
      items={[
        {
          id: 'list-1',
          name: 'Full-text search',
          description: 'Search across all text fields',
          type: QueryLibraryItemType.Sample,
          query: 'FT.SEARCH idx:bikes "@model:Explorer"',
          onRun: () => {},
          onLoad: () => {},
          onDelete: () => {},
        },
        {
          id: 'list-2',
          name: 'Vector similarity',
          description: 'KNN vector search on embeddings',
          type: QueryLibraryItemType.Saved,
          query: [
            'FT.SEARCH idx:products',
            '"*=>[KNN 5 @embedding $BLOB AS score]"',
            'PARAMS 2 BLOB "\\x00" RETURN 3 name price score',
          ].join(' '),
          onRun: () => {},
          onLoad: () => {},
          onDelete: () => {},
        },
        {
          id: 'list-3',
          name: 'Price range filter',
          description: 'Filter products within a price range',
          type: QueryLibraryItemType.Saved,
          query: [
            'FT.SEARCH idx:products',
            '"@price:[100 500]" SORTBY price ASC',
          ].join(' '),
          onRun: () => {},
          onLoad: () => {},
          onDelete: () => {},
        },
        {
          id: 'list-4',
          name: 'Tag intersection',
          type: QueryLibraryItemType.Sample,
          query: [
            'FT.SEARCH idx:bikes',
            '"@type:{mountain} @brand:{Trek|Giant}"',
          ].join(' '),
          onRun: () => {},
          onLoad: () => {},
          onDelete: () => {},
        },
        {
          id: 'list-5',
          name: 'Geo radius search',
          description: 'Find locations within a radius',
          type: QueryLibraryItemType.Sample,
          query: [
            'FT.SEARCH idx:stores',
            '"@location:[-73.935 40.730 10 km]"',
          ].join(' '),
          onRun: () => {},
          onLoad: () => {},
          onDelete: () => {},
        },
        {
          id: 'list-6',
          name: 'Numeric aggregation',
          description: 'Aggregate sales data by region',
          type: QueryLibraryItemType.Saved,
          query: [
            'FT.AGGREGATE idx:sales "*"',
            'GROUPBY 1 @region REDUCE SUM 1 @amount AS total',
          ].join(' '),
          onRun: () => {},
          onLoad: () => {},
          onDelete: () => {},
        },
        {
          id: 'list-7',
          name: 'Fuzzy text match',
          type: QueryLibraryItemType.Sample,
          query: 'FT.SEARCH idx:products "%%laptop%%"',
          onRun: () => {},
          onLoad: () => {},
          onDelete: () => {},
        },
        {
          id: 'list-8',
          name: 'Multi-field sort',
          description: 'Sort by category then by price descending',
          type: QueryLibraryItemType.Saved,
          query: [
            'FT.SEARCH idx:products "*"',
            'SORTBY category ASC price DESC LIMIT 0 50',
          ].join(' '),
          onRun: () => {},
          onLoad: () => {},
          onDelete: () => {},
        },
        {
          id: 'list-9',
          name: 'Hybrid vector search',
          description: 'Combine filters with vector similarity',
          type: QueryLibraryItemType.Sample,
          query: [
            'FT.SEARCH idx:products',
            '"(@category:{electronics})',
            '=>[KNN 10 @embedding $BLOB AS score]"',
            'PARAMS 2 BLOB "\\x00" SORTBY score ASC',
          ].join(' '),
          onRun: () => {},
          onLoad: () => {},
          onDelete: () => {},
        },
        {
          id: 'list-10',
          name: 'Prefix autocomplete',
          description: 'Autocomplete suggestions for product names',
          type: QueryLibraryItemType.Saved,
          query: 'FT.SEARCH idx:products "@name:mob*" RETURN 1 name LIMIT 0 10',
          onRun: () => {},
          onLoad: () => {},
          onDelete: () => {},
        },
      ]}
    />
  ),
}
