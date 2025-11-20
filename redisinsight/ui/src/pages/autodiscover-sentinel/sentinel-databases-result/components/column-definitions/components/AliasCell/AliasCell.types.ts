import type { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

export interface AliasCellProps {
  id?: string
  alias?: string
  error?: string | object | null
  loading?: boolean
  status?: AddRedisDatabaseStatus
  handleChangedInput: (name: string, value: string) => void
  errorNotAuth: (
    error?: string | object | null,
    status?: AddRedisDatabaseStatus,
  ) => boolean
}
