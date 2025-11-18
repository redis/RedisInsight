import React, { useEffect, useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DatabaseAnalysisFactory } from 'uiSrc/mocks/factories/database-analysis/DatabaseAnalysis.factory'

import { DatabaseAnalysisPageView } from './DatabaseAnalysisPageView'
import {
  getDBAnalysisSuccess,
  loadDBAnalysisReportsSuccess,
  setSelectedAnalysisId,
} from 'uiSrc/slices/analytics/dbAnalysis'
import { useDispatch } from 'react-redux'
import { fn } from 'storybook/test'

const meta: Meta<typeof DatabaseAnalysisPageView> = {
  component: DatabaseAnalysisPageView,
  args: {
    reports: [],
    selectedAnalysis: null,
    analysisLoading: false,
    data: null,
    handleSelectAnalysis: fn(),
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  args: {
    reports: [],
    selectedAnalysis: null,
    analysisLoading: true,
    data: null,
  },
}

const WithDataRender = () => {
  const dispatch = useDispatch()
  const data = DatabaseAnalysisFactory.build({
    totalKeys: {
      total: 7_500,
      types: [
        { type: 'string', total: 3_000 },
        { type: 'hash', total: 2_500 },
        { type: 'zset', total: 2_000 },
      ],
    } as any,
    totalMemory: {
      total: 450_000,
      types: [
        { type: 'string', total: 50_000 },
        { type: 'hash', total: 250_000 },
        { type: 'zset', total: 150_000 },
      ],
    } as any,
    topKeysLength: [
      {
        name: 'user:sessions',
        type: 'hash',
        memory: 120_000,
        length: 5_000,
        ttl: -1,
      },
      {
        name: 'orders:recent',
        type: 'list',
        memory: 80_000,
        length: 2_000,
        ttl: 3_600,
      },
    ] as any,
    topKeysMemory: [
      {
        name: 'user:sessions',
        type: 'hash',
        memory: 120_000,
        length: 5_000,
        ttl: -1,
      },
      {
        name: 'metrics:pageviews',
        type: 'zset',
        memory: 200_000,
        length: 1_000,
        ttl: -1,
      },
    ] as any,
    expirationGroups: [
      { label: 'No expiry', total: 8_000, threshold: 0 },
      { label: '<1 hr', total: 1_500, threshold: 3_600 },
      { label: '1–24 hrs', total: 500, threshold: 86_400 },
    ] as any,
  })
  const reports = useMemo(
    () => [
      {
        id: data.id,
        createdAt: data.createdAt,
        db: data.db,
      },
    ],
    [data],
  )

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
      data={data}
      handleSelectAnalysis={fn()}
    />
  )
}

export const WithData: Story = {
  render: () => <WithDataRender />,
}
