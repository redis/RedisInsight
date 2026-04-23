import { IVectorSetElementState } from './interfaces'

export const INITIAL_VECTOR_SET_ELEMENT_STATE: IVectorSetElementState = {
  id: 0,
  name: '',
  vector: '',
  attributes: '',
  showAttributes: false,
}

export const VECTOR_SEPARATOR = /[\s,]+/

export const DEFAULT_VECTOR_HELP_TEXT =
  'Format is detected automatically. The first vector defines the required dimension for this set.'
