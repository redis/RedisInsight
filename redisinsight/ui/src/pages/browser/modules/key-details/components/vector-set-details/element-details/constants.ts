import { monaco as monacoEditor } from 'react-monaco-editor'

export const VECTOR_DESCRIPTION =
  'The numerical embedding representing this item in vector space, used for similarity search and ranking.'
export const ATTRIBUTES_DESCRIPTION =
  'Structured metadata associated with this item, used for filtering, display, and hybrid search queries.'

export const ATTRIBUTES_EDITOR_OPTIONS: Partial<monacoEditor.editor.IStandaloneEditorConstructionOptions> =
  {
    domReadOnly: false,
    contextmenu: false,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    stickyScroll: { enabled: false },
    overviewRulerLanes: 0,
    renderLineHighlight: 'none',
    folding: false,
    guides: {
      indentation: false,
      bracketPairs: false,
    },
    scrollbar: {
      vertical: 'auto' as const,
      horizontal: 'auto' as const,
    },
  }
