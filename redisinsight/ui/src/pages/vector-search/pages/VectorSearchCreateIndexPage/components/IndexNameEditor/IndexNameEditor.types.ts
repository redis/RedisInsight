export interface IndexNameEditorProps {
  indexName: string
  indexNameError: string | null
  onNameChange: (name: string) => void
}
