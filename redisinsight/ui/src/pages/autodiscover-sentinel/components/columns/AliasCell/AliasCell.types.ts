import type { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

export interface AliasCellRendererProps {
  id?: string
  alias?: string
  name?: string
  handleChangedInput: (name: string, value: string) => void
}

export interface AliasResultCellRendererProps {
  id?: string
  alias?: string
  error?: string | object | null
  loading?: boolean
  status?: AddRedisDatabaseStatus
  handleChangedInput: (name: string, value: string) => void
}
