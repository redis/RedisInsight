export type SimilaritySearchMode = 'vector' | 'element'

export interface SimilaritySearchFormState {
  mode: SimilaritySearchMode
  vectorInput: string
  elementInput: string
  count: number | null
  filter: string
}

export interface SimilaritySearchFormProps {
  keyName: string
  vectorDim?: number
  onSubmit?: (state: SimilaritySearchFormState) => void
  /**
   * Fired after every form-state change. Wired to the BE-built command
   * preview thunk by the parent so the preview always matches what the
   * search endpoint would actually execute. Calls are coalesced/debounced
   * inside the consumer hook — components do not need to throttle.
   */
  onStateChange?: (state: SimilaritySearchFormState) => void
  /**
   * Fired when the user clicks the reset button. The form already resets its
   * local state internally — the parent should use this hook to clear any
   * derived slice state (search results, preview, etc.).
   */
  onReset?: () => void
  /**
   * Pre-built command preview string supplied by the parent. Rendered
   * verbatim. When empty the preview area falls back to a neutral
   * placeholder so the layout doesn't shift while the first request is
   * in flight.
   */
  preview?: string
  loading?: boolean
  /**
   * True while the BE preview request is in flight. The submit button shows
   * its loading state in this case too — kicking off a search before the
   * preview has settled would race the user's view of the command. Inputs
   * stay editable so the user can keep typing.
   */
  previewLoading?: boolean
  'data-testid'?: string
}
