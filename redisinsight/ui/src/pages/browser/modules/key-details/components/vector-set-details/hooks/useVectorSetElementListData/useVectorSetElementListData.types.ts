import { Dispatch, SetStateAction } from 'react'

import { PaginationState } from 'uiSrc/components/base/layout/table'
import { VectorSetElement } from 'uiSrc/slices/interfaces'

import {
  ElementsListConfig,
  VectorSetActionsConfig,
} from '../../vector-set-element-list/VectorSetElementList.types'

export interface UseVectorSetElementListDataParams {
  actionsConfig: VectorSetActionsConfig
}

export interface UseVectorSetElementListDataResult {
  /** Passed to the table's `meta` prop; cells read it via `table.options.meta`. */
  meta: ElementsListConfig
  currentPageData: VectorSetElement[]
  tableMinWidth: string
  pagination: PaginationState
  setPagination: Dispatch<SetStateAction<PaginationState>>
  emptyMessage: string
  isPaginationSupported?: boolean
  total: number
}
