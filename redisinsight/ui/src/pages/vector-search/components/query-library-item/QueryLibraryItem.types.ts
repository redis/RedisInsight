import { BadgeVariants } from 'uiSrc/components/base/display/badge/RiBadge'

export enum QueryLibraryItemType {
  Sample = 'sample',
  Saved = 'saved',
}

export interface QueryLibraryItemProps {
  id: string
  name: string
  type: QueryLibraryItemType
  query: string
  description?: string

  isOpen?: boolean
  onToggleOpen?: (id: string) => void

  onRun?: (id: string) => void
  onLoad?: (id: string) => void
  onDelete?: (id: string) => void

  dataTestId?: string
}

export interface QueryTypeBadgeConfig {
  label: string
  variant: BadgeVariants
}
