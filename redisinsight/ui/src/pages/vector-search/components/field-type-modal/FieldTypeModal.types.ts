import { IndexField } from '../index-details/IndexDetails.types'

export enum FieldTypeModalMode {
  Create = 'create',
  Edit = 'edit',
}

export interface FieldTypeModalProps {
  isOpen: boolean
  mode: FieldTypeModalMode
  field?: IndexField
  fields: IndexField[]
  onSubmit: (field: IndexField) => void
  onClose: () => void
}
