import type { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

export interface UsernameCellRendererProps {
  username?: string
  id?: string
  loading?: boolean
  error?: string | object | null
  status?: AddRedisDatabaseStatus
  isInvalid: boolean
  handleChangedInput: (name: string, value: string) => void
}
