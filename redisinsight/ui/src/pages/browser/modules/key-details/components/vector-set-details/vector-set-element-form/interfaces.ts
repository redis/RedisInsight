export interface IVectorSetElementState {
  id: number
  name: string
  vector: string
  attributes: string
  showAttributes: boolean
}

export interface SubmitElement {
  name: string
  vector: number[]
  attributes?: string
}

export interface Props {
  onSubmit: (elements: SubmitElement[]) => void
  onCancel: (isCancelled?: boolean) => void
  loading: boolean
  vectorDim?: number
  submitText?: string
}

export interface VectorFieldInfo {
  text: string
  isError: boolean
}
