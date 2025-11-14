import React from 'react'
import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DatabaseAnalysis } from 'apiSrc/modules/database-analysis/models'
import { Key } from 'apiSrc/modules/database-analysis/models/key'

import TopKeys from './TopKeys'

// Note: Helper functions are at the bottom of the file

const redisTypes = ['string', 'hash', 'list', 'set', 'zset', 'stream']

const meta: Meta<typeof TopKeys> = {
  component: TopKeys,
  args: {
    data: null,
    loading: false,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', border: '1px solid #ccc' }}>
        <h1>Top Keys</h1>
        <p>Component shows top keys by memory usage and length</p>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

// ============================================================================
// Story: Loading
// Shows loader while fetching keys data
// ============================================================================

export const Loading: Story = {
  args: {
    loading: true,
  },
  decorators: [
    (Story) => (
      <div>
        <h2>Loading</h2>
        <p>Component shows loader while fetching keys data</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Empty Data
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
// Story: No Keys
// Component returns null when topKeysMemory and topKeysLength are empty
// ============================================================================

export const NoKeys: Story = {
  args: {
    loading: false,
    data: createMockedDatabaseAnalysis({
      topKeysMemory: [],
      topKeysLength: [],
    }),
  },
  decorators: [
    (Story) => (
      <div>
        <h2>No Keys</h2>
        <p>Component returns null when no top keys data is available</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: With Data - Memory View
// Shows keys sorted by memory usage
// ============================================================================
export const WithData: Story = {
  args: {
    loading: false,
    data: createMockedDatabaseAnalysis({
      topKeysMemory: generateKeys(10, { prioritizeMemory: true }),
      topKeysLength: generateKeys(10, { prioritizeLength: true }),
      delimiter: ':',
    }),
  },
  decorators: [
    (Story) => (
      <div>
        <h2>With Data - Memory View</h2>
        <p>Component shows keys sorted by memory consumption (default view)</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Large Dataset
// Shows many keys (15+) which changes the title
// ============================================================================
export const LargeDataset: Story = {
  args: {
    loading: false,
    data: createMockedDatabaseAnalysis({
      topKeysMemory: generateKeys(200, { prioritizeMemory: true }),
      topKeysLength: generateKeys(200, { prioritizeLength: true }),
      delimiter: ':',
    }),
  },
  decorators: [
    (Story) => (
      <div>
        <h2>Large Dataset (15+ keys)</h2>
        <p>Component shows "TOP 15 KEYS" when dataset has 15 or more keys</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Only Memory Keys
// Shows data only for memory view (no length data)
// ============================================================================
export const OnlyMemoryKeys: Story = {
  args: {
    loading: false,
    data: createMockedDatabaseAnalysis({
      topKeysMemory: generateKeys(8, { prioritizeMemory: true }),
      topKeysLength: [],
      delimiter: ':',
    }),
  },
  decorators: [
    (Story) => (
      <div>
        <h2>Only Memory Keys</h2>
        <p>Component shows data only for memory view (no length data)</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Only Length Keys
// Shows data only for length view (no memory data)
// ============================================================================
export const OnlyLengthKeys: Story = {
  args: {
    loading: false,
    data: createMockedDatabaseAnalysis({
      topKeysMemory: [],
      topKeysLength: generateKeys(8, { prioritizeLength: true }),
      delimiter: ':',
    }),
  },
  decorators: [
    (Story) => (
      <div>
        <h2>Only Length Keys</h2>
        <p>Component shows data only for length view (no memory data)</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Big Keys with Highlights
// Shows keys that exceed threshold values and get highlighted
// ============================================================================

export const BigKeysWithHighlights: Story = {
  args: {
    loading: false,
    data: createMockedDatabaseAnalysis({
      topKeysMemory: [
        generateKey('huge:data:blob', 'string', {
          memory: 100_000_000,
          length: 50_000_000,
          ttl: 3600,
        }),
        generateKey('large:hash:object', 'hash', {
          memory: 50_000_000,
          length: 100_000,
          ttl: 7200,
        }),
        generateKey('big:list:items', 'list', {
          memory: 30_000_000,
          length: 200_000,
          ttl: -1,
        }),
      ],
      topKeysLength: [
        generateKey('huge:data:blob', 'string', {
          memory: 100_000_000,
          length: 50_000_000,
          ttl: 3600,
        }),
        generateKey('big:list:items', 'list', {
          memory: 30_000_000,
          length: 200_000,
          ttl: -1,
        }),
        generateKey('large:hash:object', 'hash', {
          memory: 50_000_000,
          length: 100_000,
          ttl: 7200,
        }),
      ],
      delimiter: ':',
    }),
  },
  decorators: [
    (Story) => (
      <div>
        <h2>Big Keys with Highlights</h2>
        <p>Component highlights keys that exceed size/length thresholds</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Keys with Various TTL
// Shows keys with different TTL values (-1 for no limit, null for empty, positive for specific time)
// ============================================================================

export const KeysWithVariousTTL: Story = {
  args: {
    loading: false,
    data: createMockedDatabaseAnalysis({
      topKeysMemory: [
        generateKey('persistent:key:1', 'string', {
          memory: 5_000_000,
          length: 1000,
          ttl: -1,
        }),
        generateKey('temp:key:1h', 'hash', {
          memory: 3_000_000,
          length: 500,
          ttl: 3600,
        }),
        generateKey('temp:key:1d', 'list', {
          memory: 2_000_000,
          length: 300,
          ttl: 86400,
        }),
        generateKey('temp:key:1w', 'set', {
          memory: 1_500_000,
          length: 200,
          ttl: 604800,
        }),
        generateKey('key:no:ttl', 'zset', {
          memory: 1_000_000,
          length: 100,
          ttl: null as any,
        }),
      ],
      topKeysLength: [
        generateKey('persistent:key:1', 'string', {
          memory: 5_000_000,
          length: 1000,
          ttl: -1,
        }),
        generateKey('temp:key:1h', 'hash', {
          memory: 3_000_000,
          length: 500,
          ttl: 3600,
        }),
        generateKey('temp:key:1d', 'list', {
          memory: 2_000_000,
          length: 300,
          ttl: 86400,
        }),
        generateKey('temp:key:1w', 'set', {
          memory: 1_500_000,
          length: 200,
          ttl: 604800,
        }),
        generateKey('key:no:ttl', 'zset', {
          memory: 1_000_000,
          length: 100,
          ttl: null as any,
        }),
      ],
      delimiter: ':',
    }),
  },
  decorators: [
    (Story) => (
      <div>
        <h2>Keys with Various TTL</h2>
        <p>
          Shows keys with different TTL values (persistent, temporary, and
          missing)
        </p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Story: Custom Delimiter
// Shows keys with different delimiter pattern
// ============================================================================

export const CustomDelimiter: Story = {
  args: {
    loading: false,
    data: createMockedDatabaseAnalysis({
      topKeysMemory: [
        generateKey('app.users.profile.1234', 'hash', {
          memory: 5_000_000,
          length: 100,
        }),
        generateKey('app.cache.session.xyz', 'string', {
          memory: 3_000_000,
          length: 500,
        }),
        generateKey('app.queue.tasks.pending', 'list', {
          memory: 2_000_000,
          length: 1000,
        }),
      ],
      topKeysLength: [
        generateKey('app.cache.session.xyz', 'string', {
          memory: 3_000_000,
          length: 500,
        }),
        generateKey('app.queue.tasks.pending', 'list', {
          memory: 2_000_000,
          length: 1000,
        }),
        generateKey('app.users.profile.1234', 'hash', {
          memory: 5_000_000,
          length: 100,
        }),
      ],
      delimiter: '.',
    }),
  },
  decorators: [
    (Story) => (
      <div>
        <h2>Custom Delimiter</h2>
        <p>Shows keys with dot (.) delimiter instead of colon (:)</p>
        <Story />
      </div>
    ),
  ],
}

// ============================================================================
// Helper Functions
// ============================================================================

function createMockedDatabaseAnalysis(
  overrides: Partial<DatabaseAnalysis> = {},
): DatabaseAnalysis {
  return {
    id: faker.string.uuid(),
    databaseId: faker.string.uuid(),
    filter: { match: '*', count: 10000 },
    delimiter: ':',
    progress: { total: 100, scanned: 100, processed: 100 },
    createdAt: new Date('2023-01-01'),
    totalKeys: { total: 1000, types: [] },
    totalMemory: { total: 10000000, types: [] },
    topKeysNsp: [],
    topMemoryNsp: [],
    topKeysLength: [],
    topKeysMemory: [],
    expirationGroups: [],
    recommendations: [],
    ...overrides,
  } as DatabaseAnalysis
}

function generateKey(
  name: string,
  type: string,
  options: { memory: number; length: number; ttl?: number },
): Key {
  return {
    name,
    type,
    memory: options.memory,
    length: options.length,
    ttl: options.ttl
      ? options.ttl
      : options.ttl === null
        ? null
        : faker.number.int({ min: -1, max: 86400 }),
  } as Key
}

function generateKeys(
  count: number,
  options: { prioritizeMemory?: boolean; prioritizeLength?: boolean } = {},
): Key[] {
  const keys: Key[] = []

  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(redisTypes)
    const baseMemory = options.prioritizeMemory
      ? faker.number.int({ min: 10000, max: 10_000_000 })
      : faker.number.int({ min: 1000, max: 1_000_000 })
    const baseLength = options.prioritizeLength
      ? faker.number.int({ min: 10000, max: 1_000_000 })
      : faker.number.int({ min: 100, max: 10_000 })

    keys.push({
      name: `${faker.word.noun()}:${faker.word.noun()}:${faker.string.alphanumeric(8)}`,
      type,
      memory: baseMemory,
      length: baseLength,
      ttl: faker.helpers.arrayElement([-1, 3600, 7200, 86400]),
    } as Key)
  }

  return options.prioritizeMemory
    ? keys.sort((a, b) => b.memory - a.memory)
    : keys.sort((a, b) => b.length - a.length)
}
