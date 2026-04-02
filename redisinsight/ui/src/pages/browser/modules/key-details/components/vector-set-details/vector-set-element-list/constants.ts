import { VectorSetColumn } from './VectorSetElementList.types'

export const DEFAULT_PAGE_SIZE = 10
export const ENABLE_PAGINATION_COUNT = 10

export const VECTOR_SET_COLUMN_HEADERS: Record<VectorSetColumn, string> = {
  [VectorSetColumn.Name]: 'Element',
  [VectorSetColumn.Actions]: '',
}
