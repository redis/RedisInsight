import { monaco as monacoEditor } from 'react-monaco-editor'
import { getCompletionProvider } from 'uiSrc/utils/monaco/completionProvider'
import { getCypherMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/cypherTokens'
import { getJmespathMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/jmespathTokens'
import { getSqliteFunctionsMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/sqliteFunctionsTokens'
import {
  cypherLanguageConfiguration,
  KEYWORDS as cypherKeywords,
  FUNCTIONS as cypherFunctions,
} from './cypher'
import { jmespathLanguageConfiguration } from './jmespath'
import {
  sqliteFunctionsLanguageConfiguration,
  SQLITE_FUNCTIONS,
} from './sqliteFunctions'
import { DSL, DSLNaming } from '../commands'

export interface MonacoSyntaxLang {
  name: string
  id: string
  language: string
  config?: monacoEditor.languages.LanguageConfiguration
  completionProvider?: (
    keywords?: string[],
    functions?: monacoEditor.languages.CompletionItem[],
  ) => monacoEditor.languages.CompletionItemProvider
  tokensProvider?: (
    keywords?: string[],
    functions?: monacoEditor.languages.CompletionItem[],
  ) => monacoEditor.languages.IMonarchLanguage
}

export interface MonacoSyntaxObject {
  [key: string]: MonacoSyntaxLang
}

export enum MonacoLanguage {
  Redis = 'redisLanguage',
  Cypher = 'cypherLanguage',
  JMESPath = 'jmespathLanguage',
  SQLiteFunctions = 'sqliteFunctions',
  Text = 'text',
  RediSearch = 'redisearch',
}

export const defaultMonacoOptions: monacoEditor.editor.IStandaloneEditorConstructionOptions =
  {
    tabCompletion: 'on',
    wordWrap: 'on',
    padding: { top: 10 },
    automaticLayout: true,
    formatOnPaste: false,
    glyphMargin: true,
    fixedOverflowWidgets: true,
    bracketPairColorization: {
      enabled: true,
      independentColorPoolPerBracketType: true,
    },
    stickyScroll: {
      enabled: true,
      defaultModel: 'indentationModel',
    },
    suggest: {
      preview: true,
      showStatusBar: true,
      showIcons: false,
    },
    minimap: {
      enabled: false,
    },
    lineNumbersMinChars: 4,
  }

export const DEFAULT_MONACO_YAML_URI = 'http://example.com/schema-name.json'
export const DEFAULT_MONACO_FILE_MATCH = '*'

export const DEDICATED_EDITOR_LANGUAGES: MonacoSyntaxObject = {
  [DSL.cypher]: {
    name: DSLNaming[DSL.cypher],
    id: MonacoLanguage.Cypher,
    language: MonacoLanguage.Cypher,
    config: cypherLanguageConfiguration,
    completionProvider: () => ({
      ...getCompletionProvider(cypherKeywords, cypherFunctions),
    }),
    tokensProvider: getCypherMonarchTokensProvider,
  },
  [DSL.sqliteFunctions]: {
    name: DSLNaming[DSL.sqliteFunctions],
    id: DSL.sqliteFunctions,
    language: MonacoLanguage.SQLiteFunctions,
    config: sqliteFunctionsLanguageConfiguration,
    completionProvider: () => ({
      ...getCompletionProvider([], SQLITE_FUNCTIONS),
    }),
    tokensProvider: () => ({
      ...getSqliteFunctionsMonarchTokensProvider(
        SQLITE_FUNCTIONS.map(({ label }) => label.toString()),
      ),
    }),
  },
  [DSL.jmespath]: {
    name: DSLNaming[DSL.jmespath],
    id: DSL.jmespath,
    language: MonacoLanguage.JMESPath,
    config: jmespathLanguageConfiguration,
    completionProvider: (
      keywords: string[] = [],
      functions: monacoEditor.languages.CompletionItem[] = [],
    ) => ({
      ...getCompletionProvider(keywords, functions),
    }),
    tokensProvider: (
      _,
      functions: monacoEditor.languages.CompletionItem[] = [],
    ) => ({
      ...getJmespathMonarchTokensProvider(
        functions.map(({ label }) => label.toString()),
      ),
    }),
  },
}

export const MONACO_MANUAL =
  '// Workbench is the advanced Redis command-line interface that allows to send commands to Redis, read and visualize the replies sent by the server.\n' +
  '// Enter multiple commands at different rows to run them at once.\n' +
  '// Start a new line with an indent (Tab) to specify arguments for any Redis command in multiple line mode.\n' +
  '// Use F1 to see the full list of shortcuts available in Workbench.\n' +
  '// Use Ctrl+Space (Cmd+Space) to see the list of commands and information about commands and their arguments in the suggestion list.\n' +
  '// Use Ctrl+Shift+Space (Cmd+Shift+Space) to see the list of arguments for commands.\n'
