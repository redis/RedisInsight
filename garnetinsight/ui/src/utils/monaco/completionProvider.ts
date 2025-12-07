import { monaco as monacoEditor } from 'react-monaco-editor'

export const getCompletionProvider = (
  keywords: string[] = [],
  functions: monacoEditor.languages.CompletionItem[] = [],
): monacoEditor.languages.CompletionItemProvider => ({
  provideCompletionItems: (
    model: monacoEditor.editor.IModel,
    position: monacoEditor.Position,
  ): monacoEditor.languages.CompletionList => {
    const word = model.getWordUntilPosition(position)
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      endColumn: word.endColumn,
      startColumn: word.startColumn,
    }

    // display suggestions only for words that don't belong to a folding area
    if (!model.getValueInRange(range).startsWith(' ')) {
      const keywordsSuggestions: monacoEditor.languages.CompletionItem[] =
        keywords.map((item: string) => ({
          label: item,
          kind: monacoEditor.languages.CompletionItemKind.Keyword,
          insertText: item,
          range,
          sortText: `a${item}`,
        }))

      const functionsSuggestions: monacoEditor.languages.CompletionItem[] =
        functions.map((item) => ({
          ...item,
          insertText: `${item.insertText ?? item.label}`,
          kind: monacoEditor.languages.CompletionItemKind.Function,
          range,
          sortText: `b${item.label}`,
          insertTextRules:
            monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }))

      return {
        suggestions: [...keywordsSuggestions, ...functionsSuggestions],
      }
    }
    return { suggestions: [] }
  },
})
