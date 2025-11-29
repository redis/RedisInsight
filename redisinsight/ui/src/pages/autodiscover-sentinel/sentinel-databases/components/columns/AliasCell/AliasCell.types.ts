export interface AliasCellRendererProps {
  id?: string
  alias?: string
  name?: string
  handleChangedInput: (name: string, value: string) => void
}
