export interface IHashFieldState {
  fieldName: string
  fieldValue: string
  fieldTTL?: string
  id: number
}

export const INITIAL_HASH_FIELD_STATE: IHashFieldState = {
  fieldName: '',
  fieldValue: '',
  id: 0,
}
