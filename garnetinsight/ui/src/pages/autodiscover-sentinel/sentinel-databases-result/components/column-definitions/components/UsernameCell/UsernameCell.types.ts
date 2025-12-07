import type { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

export interface UsernameCellProps {
  username?: string
  id?: string
  loading?: boolean
  error?: string | object | null
  status?: AddRedisDatabaseStatus
  handleChangedInput: (name: string, value: string) => void
  isInvalid: boolean
  errorNotAuth: (
    error?: string | object | null,
    status?: AddRedisDatabaseStatus,
  ) => boolean
}
