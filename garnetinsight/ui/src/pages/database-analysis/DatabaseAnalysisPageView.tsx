import React from 'react'
import {
  type DatabaseAnalysis,
  type ShortDatabaseAnalysis,
} from 'apiSrc/modules/database-analysis/models'
import { Nullable } from 'uiSrc/utils'
import { AnalysisPageContainer } from './components/analysis-page-container'
import { Header } from './components'
import DatabaseAnalysisTabs from './components/data-nav-tabs'

type Props = {
  reports: ShortDatabaseAnalysis[]
  selectedAnalysis: Nullable<string>
  analysisLoading: boolean
  data: DatabaseAnalysis | null
  handleSelectAnalysis: (value: string) => void
}
export const DatabaseAnalysisPageView = ({
  reports,
  selectedAnalysis,
  analysisLoading,
  data,
  handleSelectAnalysis,
}: Props) => {
  return (
    <AnalysisPageContainer data-testid="database-analysis-page">
      <Header
        items={reports}
        selectedValue={selectedAnalysis}
        onChangeSelectedAnalysis={handleSelectAnalysis}
        progress={data?.progress}
        analysisLoading={analysisLoading}
      />
      <DatabaseAnalysisTabs
        loading={analysisLoading}
        reports={reports}
        data={data}
      />
    </AnalysisPageContainer>
  )
}
