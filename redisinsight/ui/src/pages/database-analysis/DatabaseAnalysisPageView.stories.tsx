import React, { useEffect, useMemo } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { buildDatabaseAnalysisWithTopKeys } from 'uiSrc/mocks/factories/database-analysis/DatabaseAnalysis.factory'

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
  const { data, reports } = useMemo(
    () => buildDatabaseAnalysisWithTopKeys(),
    [],
  )

  useEffect(() => {
    dispatch(getDBAnalysisSuccess(data))
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
