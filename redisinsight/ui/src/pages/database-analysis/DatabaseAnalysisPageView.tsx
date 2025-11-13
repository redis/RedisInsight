import React from 'react'
import styled from 'styled-components'
import Header from './components/header'
import DatabaseAnalysisTabs from './components/data-nav-tabs'
import {
  type DatabaseAnalysis,
  type ShortDatabaseAnalysis,
} from 'apiSrc/modules/database-analysis/models'
import { Nullable } from 'uiSrc/utils'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

// Styled component for the main container with theme border
const MainContainer = styled(Col)<React.HTMLAttributes<HTMLDivElement>>`
  height: 100%;
  overflow: auto;
  padding-inline: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`

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
    <MainContainer data-testid="database-analysis-page">
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
    </MainContainer>
  )
}
