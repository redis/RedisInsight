import { monaco as monacoEditor } from 'react-monaco-editor'

/**
 * Monaco editor options for CommandView component.
 * Configures the editor to be read-only but allow text selection for copying.
 */
export const COMMAND_VIEW_EDITOR_OPTIONS: Partial<monacoEditor.editor.IStandaloneEditorConstructionOptions> =
  {
    // Make editor read-only to prevent editing
    readOnly: true,

    // Allow DOM interactions (text selection, copy) despite being read-only
    domReadOnly: false,

    // Disable right-click context menu
    contextmenu: false,

    // Hide the minimap (code overview on the right)
    minimap: { enabled: false },

    // Prevent scrolling past the last line
    scrollBeyondLastLine: false,

    // Disable sticky scroll header
    stickyScroll: { enabled: false },

    // Hide the overview ruler (selection/highlight indicators on the right edge)
    overviewRulerLanes: 0,

    // Don't highlight the current line where cursor is placed
    renderLineHighlight: 'none',

    // Disable code folding
    folding: false,

    // Hide vertical guide lines (indentation and bracket pair guides)
    guides: {
      indentation: false,
      bracketPairs: false,
    },

    // Show scrollbars only when content overflows
    scrollbar: {
      vertical: 'auto' as const,
      horizontal: 'auto' as const,
    },
  }
