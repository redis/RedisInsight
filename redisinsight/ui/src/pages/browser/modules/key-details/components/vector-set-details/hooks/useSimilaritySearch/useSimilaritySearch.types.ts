import { VectorSetSimilaritySearchPayload } from 'uiSrc/slices/interfaces/vectorSet'

import { SimilaritySearchFormState } from '../../similarity-search-form'

export interface UseSimilaritySearchResult {
  loading: boolean
  /**
   * True while a BE preview request is in flight. Surfaced separately from
   * `loading` so the form can keep inputs editable but signal "the command
   * is being computed" on the submit button.
   */
  previewLoading: boolean
  vectorDim?: number
  /** BE-built `VSIM` command preview for the current form state. */
  preview: string
  runSimilaritySearch: (state: SimilaritySearchFormState) => void
  /**
   * Schedule a debounced fetch of the BE-built command preview for the
   * supplied form state. Only fires when the form maps to a valid `VSIM`
   * payload; otherwise cancels any in-flight request and clears the preview.
   */
  runSimilaritySearchPreview: (state: SimilaritySearchFormState) => void
  /**
   * Clear the search results and preview slice state. Used by the form's
   * reset button and triggered automatically when the selected key changes
   * or the consumer unmounts.
   */
  resetSimilaritySearch: () => void
  /**
   * Pure mapper from form state to BE payload. Exposed primarily so unit tests
   * can pin the translation; the hook itself uses it to build the dispatch
   * payload. Returns `null` when the form state cannot be turned into a valid
   * `VSIM` request (e.g. neither element nor vector input is usable).
   */
  buildSimilaritySearchPayload: (
    state: SimilaritySearchFormState,
  ) => VectorSetSimilaritySearchPayload | null
}
