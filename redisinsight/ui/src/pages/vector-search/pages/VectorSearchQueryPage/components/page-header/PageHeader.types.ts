import { RiSelectOption } from 'uiSrc/components/base/forms/select/RiSelect'

export interface PageHeaderProps {
  indexName: string
  indexOptions: RiSelectOption[]
  onIndexChange: (value: string) => void
  onToggleIndexPanel: () => void
}
