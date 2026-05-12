import { validateVector } from '../../vector-set-element-form/utils'

import { SIMILARITY_SEARCH_COUNT_DEFAULT } from './constants'
import { SimilaritySearchFormState } from './SimilaritySearchForm.types'

export const initialFormState = (): SimilaritySearchFormState => ({
  mode: 'vector',
  vectorInput: '',
  elementInput: '',
  count: SIMILARITY_SEARCH_COUNT_DEFAULT,
  filter: '',
})

/**
 * The form is "ready" when the current state can be turned into a valid `VSIM`
 * payload. ELE mode just needs a non-empty element name; VECTOR mode runs the
 * shared vector parser/validator (which also enforces dimension matching when
 * `vectorDim` is known).
 */
export const isQueryReady = (
  state: SimilaritySearchFormState,
  vectorDim?: number,
): boolean => {
  if (state.mode === 'element') {
    return state.elementInput.trim().length > 0
  }
  const result = validateVector(state.vectorInput, vectorDim)
  return !result.error && result.kind !== undefined
}
