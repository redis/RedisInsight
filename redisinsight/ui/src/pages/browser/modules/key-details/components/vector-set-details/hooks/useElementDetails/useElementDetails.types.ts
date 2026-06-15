import { VectorSetElement } from 'uiSrc/slices/interfaces'

import { VectorSetActionTarget } from '../../vector-set-element-list/VectorSetElementList.types'

export interface UseElementDetailsResult {
  viewedElement: VectorSetElement | null
  isDetailsPanelOpen: boolean
  handleViewElement: (element: VectorSetActionTarget) => void
  handleClosePanel: () => void
  handleDrawerDidClose: () => void
}
