import { IRedisCommand } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface QueryEditorWrapperProps {
  query: string
  setQuery: (script: string) => void
  onSubmit: (value?: string) => void
}

export enum EditorTab {
  Editor = 'editor',
  Library = 'library',
}
