import { VectorSetElement } from 'uiSrc/slices/interfaces'

export interface UseElementAttributeEditorParams {
  element: VectorSetElement | null
}

export interface UseElementAttributeEditorResult {
  isEditing: boolean
  value: string
  isSaveDisabled: boolean
  onChange: (next: string) => void
  startEditing: () => void
  cancelEditing: () => void
  saveAttribute: () => void
}
