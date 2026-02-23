import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { faker } from '@faker-js/faker'
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
  render: () => {
    const types = [QueryLibraryItemType.Sample, QueryLibraryItemType.Saved]
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: `list-${i + 1}`,
      name: faker.lorem.words(3),
      description: i % 3 === 0 ? undefined : faker.lorem.sentence(),
      type: types[i % 2],
      query: `FT.SEARCH idx:${faker.word.noun()} "${faker.lorem.words(2)}"`,
      onRun: () => {},
      onLoad: () => {},
      onDelete: () => {},
    }))

    return <MultiItemWrapper items={items} />
  },
}
