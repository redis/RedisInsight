import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { IndexInfo } from 'uiSrc/pages/vector-search/hooks/useIndexInfo'
import { IndexAttributeBooleanFlag } from 'uiSrc/pages/vector-search/hooks/useIndexInfo/useIndexInfo.constants'

export interface IndexInfoProps {
  indexInfo: IndexInfo | undefined
  dataTestId?: string
}

export type IndexInfoTableData = {
  identifier: string
  attribute: string
  type: FieldTypes
  weight?: string
} & Partial<Record<IndexAttributeBooleanFlag, boolean>>
