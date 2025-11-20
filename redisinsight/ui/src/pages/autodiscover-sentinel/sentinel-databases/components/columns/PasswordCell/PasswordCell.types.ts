export interface PasswordCellRendererProps {
  password?: string
  id: string
  handleChangedInput: (name: string, value: string) => void
}
