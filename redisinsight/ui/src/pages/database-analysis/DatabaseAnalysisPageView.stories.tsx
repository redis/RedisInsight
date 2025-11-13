import React from 'react'
import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { DatabaseAnalysisPageView } from './DatabaseAnalysisPageView'

const meta: Meta<typeof DatabaseAnalysisPageView> = {
  component: DatabaseAnalysisPageView,
  args: {
    reports: [],
    selectedAnalysis: null,
    analysisLoading: false,
    data: null,
    handleSelectAnalysis: fn(),
  },
  decorators: [
    (Story) => (
      <div className="_main_foy9d_2" style={{ flexGrow: 1 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const Empty: Story = {}

// Helper functions to generate faker data
const generateKey = (type: string) => ({
  name: faker.word.noun(),
  type,
  memory: faker.number.int({ min: 32, max: 1000 }),
  length: faker.number.int({ min: 1, max: 100 }),
  ttl: faker.helpers.arrayElement([
    -1,
    faker.number.int({ min: 60, max: 86400 }),
  ]),
})

const redisTypes = ['string', 'hash', 'list', 'set', 'zset', 'stream']

const generateAnalysisData = () => {
  const analysisId = faker.string.uuid()
  const createdAt = faker.date.recent({ days: 7 })

  // Generate type distribution
  const types = redisTypes.slice(0, faker.number.int({ min: 2, max: 4 }))
  const totalKeysCount = faker.number.int({ min: 100, max: 10000 })
  const totalMemoryBytes = faker.number.int({ min: 1000, max: 100000 })

  const typeDistribution = types.map((type) => ({
    type,
    total: faker.number.int({
      min: 1,
      max: Math.floor(totalKeysCount / types.length),
    }),
  }))

  const memoryDistribution = types.map((type) => ({
    type,
    total: faker.number.int({
      min: 32,
      max: Math.floor(totalMemoryBytes / types.length),
    }),
  }))

  // Generate top keys
  const topKeys = Array.from(
    { length: faker.number.int({ min: 5, max: 10 }) },
    () => generateKey(faker.helpers.arrayElement(types)),
  )

  return {
    id: analysisId,
    databaseId: faker.string.uuid(),
    filter: {
      type: null,
      match: '*',
      count: faker.number.int({ min: 1000, max: 10000 }),
    },
    delimiter: ':',
    progress: {
      total: totalKeysCount,
      scanned: faker.number.int({
        min: totalKeysCount,
        max: totalKeysCount * 2,
      }),
      processed: totalKeysCount,
    },
    createdAt,
    totalKeys: {
      total: totalKeysCount,
      types: typeDistribution,
    },
    totalMemory: {
      total: totalMemoryBytes,
      types: memoryDistribution,
    },
    topKeysNsp: [],
    topMemoryNsp: [],
    topKeysLength: topKeys.sort((a, b) => b.length - a.length),
    topKeysMemory: [...topKeys].sort((a, b) => b.memory - a.memory),
    expirationGroups: [
      {
        label: 'No Expiry',
        total: faker.number.int({ min: 0, max: totalMemoryBytes }),
        threshold: 0,
      },
      {
        label: '<1 hr',
        total: faker.number.int({ min: 0, max: 1000 }),
        threshold: 3600,
      },
      {
        label: '1-4 Hrs',
        total: faker.number.int({ min: 0, max: 1000 }),
        threshold: 14400,
      },
      {
        label: '4-12 Hrs',
        total: faker.number.int({ min: 0, max: 1000 }),
        threshold: 43200,
      },
      {
        label: '12-24 Hrs',
        total: faker.number.int({ min: 0, max: 1000 }),
        threshold: 86400,
      },
      {
        label: '1-7 Days',
        total: faker.number.int({ min: 0, max: 1000 }),
        threshold: 604800,
      },
      {
        label: '>7 Days',
        total: faker.number.int({ min: 0, max: 1000 }),
        threshold: 2592000,
      },
      {
        label: '>1 Month',
        total: faker.number.int({ min: 0, max: 1000 }),
        threshold: 9007199254740991,
      },
    ],
    recommendations: [
      {
        name: faker.helpers.arrayElement([
          'setPassword',
          'bigHashes',
          'luaScript',
          'avoidLogicalDatabases',
        ]),
      },
    ],
    db: faker.number.int({ min: 0, max: 15 }),
  }
}

export const Default: Story = {
  render: () => {
    const data = generateAnalysisData()
    const reports = [
      {
        id: data.id,
        createdAt: data.createdAt,
        db: data.db,
      },
    ]

    return (
      <DatabaseAnalysisPageView
        reports={reports}
        selectedAnalysis={data.id}
        analysisLoading={false}
        data={data as any}
        handleSelectAnalysis={fn()}
      />
    )
  },
}
