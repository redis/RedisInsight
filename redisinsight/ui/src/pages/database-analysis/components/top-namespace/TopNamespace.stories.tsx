import React from 'react'
import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'

import TopNamespace from './TopNamespace'
import { DEFAULT_EXTRAPOLATION } from '../../constants'

const redisTypes = ['string', 'hash', 'list', 'set', 'zset', 'stream']

const meta: Meta<typeof TopNamespace> = {
  component: TopNamespace,
  args: {
    data: null,
    loading: false,
    extrapolation: DEFAULT_EXTRAPOLATION,
    onSwitchExtrapolation: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px 100px', border: '1px solid #ccc' }}>
        <h1>Top Namespace</h1>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

// ============================================================================
// Story: Loading
// Shows loader while fetching namespace data
// ============================================================================

export const Loading: Story = {
  args: {
    loading: true,
  },
  decorators: [
    (Story) => (
      <div>
        <h2>Loading</h2>
        <p>Component shows loader while fetching namespace data</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Null Data
// Component returns null when data is null
// ============================================================================

export const Empty: Story = {
  args: {
    loading: false,
    data: null,
  },
  decorators: [
    (Story) => (
      <div>
        <h2>Empty</h2>
        <p>Component returns null when data is null</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: No Total Keys
// Component returns null when totalKeys.total is 0
// ============================================================================
export const NoTotalKeys: Story = {
  args: {
    loading: false,
    data: {
      ...generateAnalysisWithNamespaces({
        withMemoryNsp: true,
        withKeysNsp: true,
      }),
      totalKeys: {
        total: 0,
        types: [],
      },
    } as any,
  },
  decorators: [
    (Story) => (
      <div>
        <h2>No Total Keys</h2>
        <p>Component returns null when totalKeys.total is 0</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Empty Namespaces
// Shows "No namespaces to display" message with Tree View link
// ===========================================================================
export const EmptyNamespaces: Story = {
  args: {
    loading: false,
    data: {
      ...generateAnalysisWithNamespaces({
        withMemoryNsp: false,
        withKeysNsp: false,
      }),
      topMemoryNsp: [],
      topKeysNsp: [],
    } as any,
  },
  decorators: [
    (Story) => (
      <div>
        <h2>Empty Namespaces</h2>
        <p>
          Component shows "No namespaces to display" message with Tree View link
        </p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: With Data - Memory View
// Shows namespaces sorted by memory consumption
// ============================================================================

export const WithData: Story = {
  args: {
    loading: false,
    data: generateAnalysisWithNamespaces({
      withMemoryNsp: true,
      withKeysNsp: true,
      nspCount: 10,
    }) as any,
    extrapolation: DEFAULT_EXTRAPOLATION,
  },
  decorators: [
    (Story) => (
      <div>
        <h2>With Data</h2>
        <p>Component shows namespaces sorted by memory consumption</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: With Extrapolation Enabled
// Shows extrapolate results switch when extrapolation is not 100%
// ============================================================================

export const WithExtrapolation: Story = {
  args: {
    loading: false,
    data: generateAnalysisWithNamespaces({
      withMemoryNsp: true,
      withKeysNsp: true,
      nspCount: 8,
    }) as any,
    extrapolation: 50,
  },
}

// ============================================================================
// Story: Large Dataset
// Shows many namespaces (stress test)
// ============================================================================

export const LargeDataset: Story = {
  args: {
    loading: false,
    data: generateAnalysisWithNamespaces({
      withMemoryNsp: true,
      withKeysNsp: true,
      nspCount: 15,
    }) as any,
    extrapolation: DEFAULT_EXTRAPOLATION,
  },
}

// ============================================================================
// Story: Only Memory Namespaces
// Shows data only for memory view (no keys data)
// ============================================================================

export const OnlyMemoryNamespaces: Story = {
  args: {
    loading: false,
    data: generateAnalysisWithNamespaces({
      withMemoryNsp: true,
      withKeysNsp: false,
      nspCount: 5,
    }) as any,
    extrapolation: DEFAULT_EXTRAPOLATION,
  },
}

// ============================================================================
// Story: Only Keys Namespaces
// Shows data only for keys view (no memory data)
// ============================================================================

export const OnlyKeysNamespaces: Story = {
  args: {
    loading: false,
    data: generateAnalysisWithNamespaces({
      withMemoryNsp: false,
      withKeysNsp: true,
      nspCount: 5,
    }) as any,
    extrapolation: DEFAULT_EXTRAPOLATION,
  },
}

// ============================================================================
// Story: With Custom Delimiter
// Shows namespaces with different delimiter
// ============================================================================

export const WithCustomDelimiter: Story = {
  args: {
    loading: false,
    data: {
      ...generateAnalysisWithNamespaces({
        withMemoryNsp: true,
        withKeysNsp: true,
        nspCount: 7,
      }),
      delimiter: '.',
      topMemoryNsp: Array.from({ length: 7 }, () => ({
        ...generateNamespace(),
        nsp: `${faker.word.noun()}.${faker.word.noun()}`,
      })).sort((a, b) => b.memory - a.memory),
      topKeysNsp: Array.from({ length: 7 }, () => ({
        ...generateNamespace(),
        nsp: `${faker.word.noun()}.${faker.word.noun()}`,
      })).sort((a, b) => b.keys - a.keys),
    } as any,
    extrapolation: DEFAULT_EXTRAPOLATION,
  },
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateNspTypeSummary(type: string) {
  return {
    type,
    memory: faker.number.int({ min: 1000, max: 500000 }),
    keys: faker.number.int({ min: 1, max: 100 }),
  }
}

function generateNamespace() {
  const types = faker.helpers.arrayElements(
    redisTypes,
    faker.number.int({ min: 1, max: 3 }),
  )
  return {
    nsp: `${faker.word.noun()}:${faker.word.noun()}`,
    memory: faker.number.int({ min: 10000, max: 1000000 }),
    keys: faker.number.int({ min: 10, max: 1000 }),
    types: types.map(generateNspTypeSummary),
  }
}

function generateAnalysisWithNamespaces(options: {
  withMemoryNsp?: boolean
  withKeysNsp?: boolean
  nspCount?: number
}): Partial<DatabaseAnalysis> {
  const { withMemoryNsp = true, withKeysNsp = true, nspCount = 5 } = options

  return {
    id: faker.string.uuid(),
    databaseId: faker.string.uuid(),
    delimiter: ':',
    totalKeys: {
      total: faker.number.int({ min: 1000, max: 10000 }),
      types: redisTypes.slice(0, 3).map((type) => ({
        type,
        total: faker.number.int({ min: 100, max: 1000 }),
      })),
    },
    totalMemory: {
      total: faker.number.int({ min: 1000000, max: 10000000 }),
      types: redisTypes.slice(0, 3).map((type) => ({
        type,
        total: faker.number.int({ min: 100000, max: 1000000 }),
      })),
    },
    topMemoryNsp: withMemoryNsp
      ? Array.from({ length: nspCount }, generateNamespace).sort(
          (a, b) => b.memory - a.memory,
        )
      : [],
    topKeysNsp: withKeysNsp
      ? Array.from({ length: nspCount }, generateNamespace).sort(
          (a, b) => b.keys - a.keys,
        )
      : [],
    topKeysLength: [],
    topKeysMemory: [],
    expirationGroups: [],
    recommendations: [],
  } as any
}
