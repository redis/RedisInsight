import { monaco as monacoEditor } from 'react-monaco-editor'
import { IRedisCommand } from 'uiSrc/constants'

export interface IMonacoCommand {
  name: string
  info?: IRedisCommand
  position?: monacoEditor.Position
}

export interface IMonacoQuery {
  name: string
  fullQuery: string
  commandQuery: string
  args: [string[], string[]]
  cursor: {
    isCursorInQuotes: boolean
    prevCursorChar: string
    nextCursorChar: string
    argLeftOffset: number
    argRightOffset: number
  }
  allArgs: string[]
  info?: IRedisCommand
  commandPosition: any
  position?: monacoEditor.Position
  commandCursorPosition: number
}
