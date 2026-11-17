import React, { useState } from 'react'
import { useTranslation } from 'uiSrc/i18n'
import { TableView } from 'uiSrc/pages/database-analysis/constants'
import { Nullable } from 'uiSrc/utils'
import TableLoader from 'uiSrc/pages/database-analysis/components/table-loader'
import { TextBtn } from 'uiSrc/pages/database-analysis/components/base/TextBtn'
import { DatabaseAnalysis } from 'apiClient'
import {
  Section,
  SectionTitle,
  SectionTitleWrapper,
} from 'uiSrc/pages/database-analysis/components/styles'

import TopKeysTable from './TopKeysTable'
import { SectionContent } from 'uiSrc/pages/database-analysis/components/top-namespace/TopNamespace.styles'

export interface Props {
  data: Nullable<DatabaseAnalysis>
  loading: boolean
}

const MAX_TOP_KEYS = 15
const TopKeys = ({ data, loading }: Props) => {
  const { t } = useTranslation()
  const { topKeysLength = [], topKeysMemory = [], delimiter } = data || {}
  const [tableView, setTableView] = useState<TableView>(TableView.MEMORY)

  if (loading) {
    return <TableLoader />
  }

  if (!topKeysLength?.length && !topKeysMemory?.length) {
    return null
  }

  return (
    <Section>
      <SectionTitleWrapper>
        <SectionTitle size="M" data-testid="top-keys-title">
          {topKeysLength.length < MAX_TOP_KEYS &&
          topKeysMemory?.length < MAX_TOP_KEYS
            ? t('analytics.databaseAnalysis.topKeys.title')
            : t('analytics.databaseAnalysis.topKeys.titleMax', {
                max: MAX_TOP_KEYS,
              })}
        </SectionTitle>
        <TextBtn
          $active={tableView === TableView.MEMORY}
          size="small"
          onClick={() => setTableView(TableView.MEMORY)}
          disabled={tableView === TableView.MEMORY}
          data-testid="btn-change-table-memory"
        >
          {t('analytics.databaseAnalysis.topKeys.byMemory')}
        </TextBtn>
        <TextBtn
          $active={tableView === TableView.KEYS}
          size="small"
          onClick={() => setTableView(TableView.KEYS)}
          disabled={tableView === TableView.KEYS}
          data-testid="btn-change-table-keys"
        >
          {t('analytics.databaseAnalysis.topKeys.byLength')}
        </TextBtn>
      </SectionTitleWrapper>
      <SectionContent>
        {tableView === TableView.MEMORY && (
          <TopKeysTable
            data={topKeysMemory}
            defaultSortField="memory"
            delimiter={delimiter}
            dataTestid="top-keys-table-memory"
          />
        )}
        {tableView === TableView.KEYS && (
          <TopKeysTable
            data={topKeysLength}
            defaultSortField="length"
            delimiter={delimiter}
            dataTestid="top-keys-table-length"
          />
        )}
      </SectionContent>
    </Section>
  )
}

export default TopKeys
