import type { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

export interface AliasCellRendererProps {
  id?: string
  alias?: string
  error?: string | object | null
  loading?: boolean
  status?: AddRedisDatabaseStatus
  handleChangedInput: (name: string, value: string) => void
}
