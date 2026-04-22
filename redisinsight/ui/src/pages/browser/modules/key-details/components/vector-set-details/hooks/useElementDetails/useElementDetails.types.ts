import { VectorSetElement } from 'uiSrc/slices/interfaces'

export interface UseElementDetailsResult {
  viewedElement: VectorSetElement | null
  isDetailsPanelOpen: boolean
  handleViewElement: (element: VectorSetElement) => void
  handleClosePanel: () => void
  handleDrawerDidClose: () => void
}
