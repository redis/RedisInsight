import type { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

export interface DbCellProps {
  db?: number
  id?: string
  loading?: boolean
  status?: AddRedisDatabaseStatus
  error?: string | object | null
  handleChangedInput: (name: string, value: string) => void
}
