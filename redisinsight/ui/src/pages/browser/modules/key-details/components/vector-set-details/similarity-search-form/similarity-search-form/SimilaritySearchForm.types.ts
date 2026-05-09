export type SimilaritySearchMode = 'vector' | 'element'

export interface SimilaritySearchFormState {
  mode: SimilaritySearchMode
  vectorInput: string
  elementInput: string
  count: number | null
  filter: string
}
