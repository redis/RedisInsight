import { Dispatch, SetStateAction } from 'react'

import { ColumnDef, PaginationState } from 'uiSrc/components/base/layout/table'
import { VectorSetElement } from 'uiSrc/slices/interfaces'

import { VectorSetActionsConfig } from '../../vector-set-element-list/VectorSetElementList.types'

export interface UseVectorSetElementListDataParams {
  actionsConfig: VectorSetActionsConfig
}

export interface UseVectorSetElementListDataResult {
  columns: ColumnDef<VectorSetElement>[]
  currentPageData: VectorSetElement[]
  tableMinWidth: string
  pagination: PaginationState
  setPagination: Dispatch<SetStateAction<PaginationState>>
  emptyMessage: string
  isPaginationSupported?: boolean
  total: number
}
