export interface Props {
  openAddItemPanel: () => void
  /** Whether to render the "Previewing X out of Y" summary. */
  showPreview: boolean
  /** X — number of items currently displayed (elements or similarity matches). */
  previewCount: number
  /** Y — total number of items in the vector set. */
  total: number
}
