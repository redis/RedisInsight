import { IndexField } from '../../IndexDetails.types'

export interface FieldActionsCellProps {
  field: IndexField
  onEdit?: (field: IndexField) => void
}
