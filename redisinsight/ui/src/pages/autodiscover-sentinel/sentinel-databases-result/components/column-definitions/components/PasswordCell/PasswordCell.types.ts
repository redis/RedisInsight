import type { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

export interface PasswordCellRendererProps {
  password?: string
  id?: string
  error?: string | object | null
  loading?: boolean
  status?: AddRedisDatabaseStatus
  handleChangedInput: (name: string, value: string) => void
  isInvalid: boolean
}
