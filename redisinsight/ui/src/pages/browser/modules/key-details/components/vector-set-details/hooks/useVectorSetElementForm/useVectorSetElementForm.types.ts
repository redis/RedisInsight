import {
  IVectorSetElementState,
  SubmitElement,
} from '../../vector-set-element-form/interfaces'

export type EditableStringField = 'name' | 'vector' | 'attributes'

export interface UseVectorSetElementFormParams {
  vectorDim?: number
  onSubmit: (elements: SubmitElement[]) => void
}

export interface UseVectorSetElementFormResult {
  elements: IVectorSetElementState[]
  isFormValid: boolean
  lastAddedNameRef: React.RefObject<HTMLInputElement>
  addElement: () => void
  onClickRemove: (item: IVectorSetElementState) => void
  handleFieldChange: (
    field: EditableStringField,
    id: number,
    value: string,
  ) => void
  toggleAttributes: (id: number) => void
  submitData: () => void
  isClearDisabled: (item: IVectorSetElementState) => boolean
}
