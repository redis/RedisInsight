import type { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

export interface ResultCellRendererProps {
  status?: AddRedisDatabaseStatus
  message?: string
  name: string
  error?: string | object | null
  alias?: string
  loading?: boolean
  addActions?: boolean
  onAddInstance?: (name: string) => void
}
