import { monaco as monacoEditor } from 'react-monaco-editor'
import { Maybe } from 'uiSrc/utils'
import { IRedisCommand, IRedisCommandTree } from 'uiSrc/constants'

export enum ArgName {
  NArgs = 'nargs',
  Count = 'count',
}

export interface FoundCommandArgument {
  isComplete?: boolean
  stopArg: Maybe<IRedisCommand>
  isBlocked: boolean
  append: Maybe<Array<IRedisCommandTree[]>>
  parent: Maybe<IRedisCommand>
  token?: Maybe<IRedisCommand>
}

export interface CursorContext {
  prevCursorChar: string
  nextCursorChar: string
  isCursorInQuotes: boolean
  currentOffsetArg: string
  offset: number
  argLeftOffset: number
  argRightOffset: number
  range: monacoEditor.IRange
}

export interface BlockTokensTree {
  queryArgs: string[]
  command?: IRedisCommand
  parent?: BlockTokensTree
}
