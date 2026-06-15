export interface Props {
  width: number
  title?: string
  onClick: () => void
  /**
   * Prefix prepended to the base `clear-results-btn` test id, so consumers
   * can disambiguate multiple Clear actions on the same screen
   * (e.g. `similarity-search` → `similarity-search-clear-results-btn`).
   */
  testIdPrefix?: string
}
