/**
 * Per-match context window shown when a result row is expanded: a toggle plus
 * the ±N neighbour count. A display concern, kept out of the ARGREP command.
 */
export type ContextOption = {
  enabled: boolean
  count: number
}

export interface ContextControlProps {
  /** Current toggle + count state (owned by SearchTab). */
  context: ContextOption
  /** Patch the context state (partial merge). */
  onChange: (patch: Partial<ContextOption>) => void
  /**
   * Disables the toggle and the count input. Mirrors the Search form's prior
   * coupling to `isRefreshDisabled` so behavior is unchanged by the move.
   */
  disabled?: boolean
}
