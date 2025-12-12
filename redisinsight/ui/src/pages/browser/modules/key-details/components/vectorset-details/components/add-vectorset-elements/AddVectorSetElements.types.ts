export type AddVectorSetElementsProps = {
  closePanel: (isCancelled?: boolean) => void
}

export type VectorSetElementStateType = {
  id: number
  name: string
  vector: string
  attributes: string
}

export const INITIAL_VECTORSET_ELEMENT_STATE: VectorSetElementStateType = {
  id: 0,
  name: '',
  vector: '',
  attributes: '',
}
