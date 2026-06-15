import { ReactNode } from 'react'

export interface Props {
  openAddItemPanel: () => void
  /** Render the "Previewing X out of Y" summary. */
  showPreview: boolean
  /** X — items currently displayed. */
  previewCount: number
  /** Y — total items in the vector set. */
  total: number
  /** Swaps "Add Elements" for "Clear results" when `true`. */
  hasSimilarityResults: boolean
  onClearResults: () => void
  /**
   * Extra actions rendered at the right end of the actions row.
   * Render-prop so callers can react to the AutoSizer-reported width.
   */
  additionalActions?: (width: number) => ReactNode
}
