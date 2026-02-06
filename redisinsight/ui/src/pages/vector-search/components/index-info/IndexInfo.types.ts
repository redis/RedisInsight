import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { IndexInfo } from 'uiSrc/pages/vector-search/hooks/useIndexInfo'

export interface IndexInfoProps {
  indexInfo: IndexInfo | undefined
  dataTestId?: string
}

export interface IndexInfoTableData {
  identifier: string
  attribute: string
  type: FieldTypes
  weight?: string
}
