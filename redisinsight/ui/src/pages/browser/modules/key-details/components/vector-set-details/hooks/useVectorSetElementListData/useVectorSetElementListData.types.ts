import { Dispatch, SetStateAction } from 'react'

import { ColumnDef, PaginationState } from 'uiSrc/components/base/layout/table'
import { VectorSetElement } from 'uiSrc/slices/interfaces'

export interface UseVectorSetElementListDataParams {
  onRemoveKey: () => void
  onViewElement: (element: VectorSetElement) => void
  onSearchByElement: (element: VectorSetElement) => void
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
