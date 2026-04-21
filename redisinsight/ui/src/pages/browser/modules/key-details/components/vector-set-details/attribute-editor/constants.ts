import { monaco as monacoEditor } from 'react-monaco-editor'

export const ATTRIBUTES_EDITOR_OPTIONS: Partial<monacoEditor.editor.IStandaloneEditorConstructionOptions> =
  {
    automaticLayout: true,
    contextmenu: false,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    stickyScroll: { enabled: false },
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
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

export const ATTRIBUTES_WARNING_MESSAGE =
  'Non-JSON attributes are not supported as filter expressions in similarity search queries.'

export const JSON_VALIDATION_DEBOUNCE_MS = 500

export const DEFAULT_ATTRIBUTE_EDITOR_HEIGHT = '200px'
