import { monaco as monacoEditor } from 'react-monaco-editor'
import sqliteFunctions from './functions'
import {
  generateArgsNames,
  generateArgsForInsertText,
  getCommandMarkdown,
} from '../../../utils/commands'

export const sqliteFunctionsLanguageConfiguration: monacoEditor.languages.LanguageConfiguration =
  {
    brackets: [
      ['(', ')'],
      ['{', '}'],
      ['[', ']'],
      ["'", "'"],
      ['"', '"'],
    ],
  }

const sqliteFunctionsParsed: monacoEditor.languages.CompletionItem[] =
  Object.entries(sqliteFunctions).map(([labelInit, func]) => {
    const { arguments: args } = func
    const label = labelInit.toUpperCase()
    const range = {
      startLineNumber: 0,
      endLineNumber: 0,
      startColumn: 0,
      endColumn: 0,
    }
    const detail = `${label}(${generateArgsNames('', args).join(', ')})`
    const argsNames = generateArgsNames('', args, false, true)
    const insertText = `${label}(${generateArgsForInsertText(argsNames, ', ')})`

    return {
      label,
      detail,
      range,
      documentation: {
        value: getCommandMarkdown(func),
      },
      insertText,
      kind: monacoEditor.languages.CompletionItemKind.Function,
      insertTextRules:
        monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    }
  })

export const SQLITE_FUNCTIONS: monacoEditor.languages.CompletionItem[] =
  sqliteFunctionsParsed
