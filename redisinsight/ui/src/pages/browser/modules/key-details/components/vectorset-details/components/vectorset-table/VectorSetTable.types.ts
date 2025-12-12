import {
  VectorSetElement,
  VectorSetSearchResult,
} from 'uiSrc/slices/interfaces/vectorset'

export interface VectorSetTableProps {
  onRemoveKey: () => void
  isSearchMode?: boolean
}

export type VectorSetDisplayItem = VectorSetElement | VectorSetSearchResult
