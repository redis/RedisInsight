export interface Props {
  openAddItemPanel: () => void
  /** Whether to render the "Previewing X out of Y" summary. */
  showPreview: boolean
  /** X — number of items currently displayed (elements or similarity matches). */
  previewCount: number
  /** Y — total number of items in the vector set. */
  total: number
  /**
   * When `true`, the subheader replaces the "Add Elements" action with a
   * "Clear results" action wired to {@link onClearResults}. The browse-mode
   * affordances (formatter, add panel trigger) are hidden because they don't
   * make sense in the similarity-search context.
   */
  hasSimilarityResults: boolean
  /** Callback fired when the "Clear results" button is clicked. */
  onClearResults: () => void
}
