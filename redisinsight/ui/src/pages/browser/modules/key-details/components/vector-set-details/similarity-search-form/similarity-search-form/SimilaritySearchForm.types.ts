export type SimilaritySearchMode = 'vector' | 'element'

export interface SimilaritySearchFormState {
  mode: SimilaritySearchMode
  vectorInput: string
  elementInput: string
  count: number | null
  filter: string
}

/**
 * Request to prefill the form with an existing element name and switch to the
 * Element search mode. The `nonce` lets the same value be requested more than
 * once (e.g. clicking the same row's search icon twice still re-applies the
 * prefill even though `value` is unchanged).
 */
export interface SimilaritySearchPrefill {
  value: string
  nonce: number
}

export interface SimilaritySearchFormProps {
  prefillElement?: SimilaritySearchPrefill
}
