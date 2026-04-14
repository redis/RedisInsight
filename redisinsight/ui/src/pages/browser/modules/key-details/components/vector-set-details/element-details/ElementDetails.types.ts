import { VectorSetElement } from 'uiSrc/slices/interfaces'

export interface ElementDetailsProps {
  element: VectorSetElement | null
  isOpen: boolean
  onClose: () => void
}
