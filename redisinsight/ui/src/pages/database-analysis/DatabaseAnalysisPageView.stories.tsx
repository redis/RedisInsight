import React, { useEffect, useMemo } from 'react'
import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { useDispatch } from 'react-redux'

import { DatabaseAnalysisPageView } from './DatabaseAnalysisPageView'
import {
  getDBAnalysis,
  getDBAnalysisSuccess,
  loadDBAnalysisReportsSuccess,
  setSelectedAnalysisId,
} from 'uiSrc/slices/analytics/dbAnalysis'

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
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

// ============================================================================
// Helper Functions
// ============================================================================

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

// ============================================================================
// Story: Empty - No Reports Available
// Shows "No database analysis reports" empty state
// ============================================================================

export const Empty: Story = {
  args: {
    reports: [],
    selectedAnalysis: null,
    analysisLoading: false,
    data: null,
  },
}

// ============================================================================
// Story: LoadingInitial - First Analysis Loading
// Shows loading state when no reports exist yet
// ============================================================================

const LoadingInitialRender = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getDBAnalysis())
    dispatch(loadDBAnalysisReportsSuccess([]))
  }, [dispatch])

  return (
    <DatabaseAnalysisPageView
      reports={[]}
      selectedAnalysis={null}
      analysisLoading={true}
      data={null}
      handleSelectAnalysis={fn()}
    />
  )
}

export const LoadingInitial: Story = {
  render: () => <LoadingInitialRender />,
}

// ============================================================================
// Story: LoadingWithReports - Loading Analysis with Existing Reports
// Shows loading spinners while analysis is in progress
// ============================================================================

const LoadingWithReportsRender = () => {
  const dispatch = useDispatch()

  const { analysisId, reports } = useMemo(() => {
    const id = faker.string.uuid()
    return {
      analysisId: id,
      reports: [
        {
          id,
          createdAt: faker.date.recent({ days: 7 }),
          db: 0,
        },
      ],
    }
  }, [])

  useEffect(() => {
    dispatch(getDBAnalysis())
    dispatch(loadDBAnalysisReportsSuccess(reports))
    dispatch(setSelectedAnalysisId(analysisId))
  }, [dispatch, analysisId, reports])

  return (
    <DatabaseAnalysisPageView
      reports={reports}
      selectedAnalysis={analysisId}
      analysisLoading={true}
      data={null}
      handleSelectAnalysis={fn()}
    />
  )
}

export const LoadingWithReports: Story = {
  render: () => <LoadingWithReportsRender />,
}

// ============================================================================
// Story: EncryptedData - Analysis Data is Encrypted
// Shows "Results encrypted" empty state
// ============================================================================

const EncryptedDataRender = () => {
  const dispatch = useDispatch()

  const { analysisId, reports } = useMemo(() => {
    const id = faker.string.uuid()
    return {
      analysisId: id,
      reports: [
        {
          id,
          createdAt: faker.date.recent({ days: 7 }),
          db: 0,
        },
      ],
    }
  }, [])

  const encryptedData = useMemo(() => ({
    id: analysisId,
    databaseId: faker.string.uuid(),
    filter: null,
    delimiter: ':',
    progress: null,
    createdAt: faker.date.recent({ days: 1 }),
    totalKeys: null, // null means encrypted
    totalMemory: null,
    topKeysNsp: [],
    topMemoryNsp: [],
    topKeysLength: [],
    expirationGroups: [],
    recommendations: [],
    db: 0,
  }), [analysisId])

  useEffect(() => {
    dispatch(getDBAnalysisSuccess(encryptedData as any))
    dispatch(loadDBAnalysisReportsSuccess(reports))
    dispatch(setSelectedAnalysisId(analysisId))
  }, [dispatch, analysisId, reports, encryptedData])

  return (
    <DatabaseAnalysisPageView
      reports={reports}
      selectedAnalysis={analysisId}
      analysisLoading={false}
      data={encryptedData as any}
      handleSelectAnalysis={fn()}
    />
  )
}

export const EncryptedData: Story = {
  render: () => <EncryptedDataRender />,
}

// ============================================================================
// Story: EmptyKeys - Analysis Complete But No Keys Found
// Shows "No keys to display" empty state
// ============================================================================

const EmptyKeysRender = () => {
  const dispatch = useDispatch()

  const { analysisId, reports, data } = useMemo(() => {
    const id = faker.string.uuid()
    return {
      analysisId: id,
      reports: [
        {
          id,
          createdAt: faker.date.recent({ days: 7 }),
          db: 0,
        },
      ],
      data: {
        id,
        databaseId: faker.string.uuid(),
        filter: {
          type: null,
          match: '*',
          count: 10000,
        },
        delimiter: ':',
        progress: {
          total: 0,
          scanned: 0,
          processed: 0,
        },
        createdAt: faker.date.recent({ days: 1 }),
        totalKeys: {
          total: 0, // No keys found
          types: [],
        },
        totalMemory: {
          total: 0,
          types: [],
        },
        topKeysNsp: [],
        topMemoryNsp: [],
        topKeysLength: [],
        expirationGroups: [],
        recommendations: [],
        db: 0,
      },
    }
  }, [])

  useEffect(() => {
    dispatch(getDBAnalysisSuccess(data as any))
    dispatch(loadDBAnalysisReportsSuccess(reports))
    dispatch(setSelectedAnalysisId(analysisId))
  }, [dispatch, analysisId, reports, data])

  return (
    <DatabaseAnalysisPageView
      reports={reports}
      selectedAnalysis={analysisId}
      analysisLoading={false}
      data={data as any}
      handleSelectAnalysis={fn()}
    />
  )
}

export const EmptyKeys: Story = {
  render: () => <EmptyKeysRender />,
}

// ============================================================================
// Story: WithData - Normal State with Analysis Data
// Shows complete analysis with all charts and data
// ============================================================================

const WithDataRender = () => {
  const dispatch = useDispatch()
  const data = useMemo(() => generateAnalysisData(), [])
  const reports = useMemo(() => [
    {
      id: data.id,
      createdAt: data.createdAt,
      db: data.db,
    },
  ], [data])

  useEffect(() => {
    dispatch(getDBAnalysisSuccess(data as any))
    dispatch(loadDBAnalysisReportsSuccess(reports))
    dispatch(setSelectedAnalysisId(data.id))
  }, [dispatch, data, reports])

  return (
    <DatabaseAnalysisPageView
      reports={reports}
      selectedAnalysis={data.id}
      analysisLoading={false}
      data={data as any}
      handleSelectAnalysis={fn()}
    />
  )
}

export const WithData: Story = {
  render: () => <WithDataRender />,
}

// ============================================================================
// Story: WithMultipleReports - Multiple Analysis Reports Available
// Shows dropdown with multiple report options
// ============================================================================

const WithMultipleReportsRender = () => {
  const dispatch = useDispatch()
  
  const { reports, latestData } = useMemo(() => {
    const latest = generateAnalysisData()
    const reportsData = [
      {
        id: latest.id,
        createdAt: latest.createdAt,
        db: latest.db,
      },
      {
        id: faker.string.uuid(),
        createdAt: faker.date.recent({ days: 2 }),
        db: 0,
      },
      {
        id: faker.string.uuid(),
        createdAt: faker.date.recent({ days: 5 }),
        db: 1,
      },
      {
        id: faker.string.uuid(),
        createdAt: faker.date.recent({ days: 10 }),
        db: 0,
      },
    ]
    return { reports: reportsData, latestData: latest }
  }, [])

  useEffect(() => {
    dispatch(getDBAnalysisSuccess(latestData as any))
    dispatch(loadDBAnalysisReportsSuccess(reports))
    dispatch(setSelectedAnalysisId(latestData.id))
  }, [dispatch, latestData, reports])

  return (
    <DatabaseAnalysisPageView
      reports={reports}
      selectedAnalysis={latestData.id}
      analysisLoading={false}
      data={latestData as any}
      handleSelectAnalysis={fn()}
    />
  )
}

export const WithMultipleReports: Story = {
  render: () => <WithMultipleReportsRender />,
}

// ============================================================================
// Story: WithRecommendations - Data with Tips/Recommendations
// Shows analysis with recommendations badge on Tips tab
// ============================================================================

const WithRecommendationsRender = () => {
  const dispatch = useDispatch()
  
  const { data, reports } = useMemo(() => {
    const analysisData = generateAnalysisData()
    // Ensure we have multiple recommendations
    analysisData.recommendations = [
      {
        name: 'bigHashes',
      },
      {
        name: 'useSmallerKeys',
      },
      {
        name: 'avoidLogicalDatabases',
      },
      {
        name: 'setPassword',
      },
      {
        name: 'luaScript',
      },
    ]
    
    const reportsData = [
      {
        id: analysisData.id,
        createdAt: analysisData.createdAt,
        db: analysisData.db,
      },
    ]
    
    return { data: analysisData, reports: reportsData }
  }, [])

  useEffect(() => {
    dispatch(getDBAnalysisSuccess(data as any))
    dispatch(loadDBAnalysisReportsSuccess(reports))
    dispatch(setSelectedAnalysisId(data.id))
  }, [dispatch, data, reports])

  return (
    <DatabaseAnalysisPageView
      reports={reports}
      selectedAnalysis={data.id}
      analysisLoading={false}
      data={data as any}
      handleSelectAnalysis={fn()}
    />
  )
}

export const WithRecommendations: Story = {
  render: () => <WithRecommendationsRender />,
}
