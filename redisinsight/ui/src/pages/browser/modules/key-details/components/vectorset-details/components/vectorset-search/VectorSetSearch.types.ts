import { VectorSearchQueryType } from 'uiSrc/constants'

export interface VectorSetSearchProps {
  onSearch: () => void
  onClear: () => void
}

export type SearchQueryType =
  | VectorSearchQueryType.ELE
  | VectorSearchQueryType.VALUES
