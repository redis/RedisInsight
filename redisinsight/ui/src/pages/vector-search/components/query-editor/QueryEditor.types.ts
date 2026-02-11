export interface OnboardingTemplate {
  /** The Redis command name (used as the suggestion label). */
  command: string
  /** Short description shown as the suggestion detail. */
  detail: string
  /** Whether the template includes an index argument placeholder. */
  usesIndex: boolean
}

export interface QueryEditorWrapperProps {
  query: string
  setQuery: (script: string) => void
  onSubmit: (value?: string) => void
}

export enum EditorTab {
  Editor = 'editor',
  Library = 'library',
}

export interface EditorLibraryToggleProps {
  activeTab: EditorTab
  onChangeTab: (tab: EditorTab) => void
}
