import { monaco as monacoEditor } from 'react-monaco-editor'
import {
  first,
  isEmpty,
  isNaN,
  isUndefined,
  reject,
  toNumber,
  without,
} from 'lodash'
import { decode } from 'html-entities'
import { ICommand, ICommands } from 'uiSrc/constants'
import {
  generateArgsForInsertText,
  generateArgsNames,
  getCommandMarkdown,
  IMonacoCommand,
  IMonacoQuery,
} from 'uiSrc/utils'
import { TJMESPathFunctions } from 'uiSrc/slices/interfaces'
import { Nullable } from '../types'
import { getCommandRepeat, isRepeatCountCorrect } from '../commands'

const COMMENT_SYMBOLS = '//'
const BLANK_LINE_REGEX = /^\s*\n/gm
const QUOTES = ["'", '"', '`']
const COMMENT_LINE_REGEX = /^\s+\/\/.*/

const removeCommentsFromLine = (
  text: string = '',
  prefix: string = '',
): string => {
  const [command, ...rest] = text.split(COMMENT_SYMBOLS)
  const isOddQuotes = QUOTES.some(
    (quote: string) => ((prefix + command).split(quote).length - 1) % 2 !== 0,
  )

  if (isOddQuotes && command && rest.length) {
    return removeCommentsFromLine(
      rest.join(COMMENT_SYMBOLS),
      prefix + command + COMMENT_SYMBOLS,
    )
  }

  return prefix + text.replace(/\/\/.*/, '')
}

export const splitMonacoValuePerLines = (command = '') => {
  const linesResult: string[] = []
  const lines = getMonacoLines(command)
  // remove execute params
  if (isParamsLine(first(lines))) {
    lines.splice(0, 1, removeParams(first(lines)))
  }

  lines.forEach((line) => {
    const [commandLine, countRepeat] = getCommandRepeat(line || '')

    if (!isRepeatCountCorrect(countRepeat)) {
      linesResult.push(line)
      return
    }
    linesResult.push(...Array(countRepeat).fill(commandLine))
  })

  return linesResult
}

export const getMultiCommands = (commands: string[] = []) =>
  reject(commands, isEmpty).join('\n') ?? ''

export const removeMonacoComments = (text: string = '') =>
  text
    .split('\n')
    .filter((line: string) => !COMMENT_LINE_REGEX.test(line))
    .map((line: string) => removeCommentsFromLine(line))
    .join('\n')
    .trim()

export const getCommandsForExecution = (query = '') =>
  without(
    splitMonacoValuePerLines(query).map((command) =>
      removeMonacoComments(decode(command).trim()),
    ),
    '',
  )

export const multilineCommandToOneLine = (text: string = '') =>
  text
    .split(/(\r\n|\n|\r)+\s+/gm)
    .filter((line: string) => !(BLANK_LINE_REGEX.test(line) || isEmpty(line)))
    .join(' ')

export const findCommandEarlier = (
  model: monacoEditor.editor.ITextModel,
  position: monacoEditor.Position,
  commandsSpec: ICommands = {},
  commandsArray: string[] = [],
): Nullable<IMonacoCommand> => {
  const { lineNumber } = position
  let commandName = ''
  const notCommandRegEx = /^\s|\/\//

  // find command in the previous lines if current line is argument
  // eslint-disable-next-line for-direction
  for (
    let previousLineNumber = lineNumber;
    previousLineNumber > 0;
    previousLineNumber--
  ) {
    commandName = model.getLineContent(previousLineNumber)?.toUpperCase() ?? ''

    if (!notCommandRegEx.test(commandName)) {
      break
    }
  }

  const matchedCommand = commandsArray.find((command) =>
    commandName?.trim().startsWith(command),
  )

  if (isUndefined(matchedCommand)) {
    return null
  }

  return {
    position,
    name: matchedCommand,
    info: commandsSpec[matchedCommand],
  }
}

export const isCompositeArgument = (
  arg: string,
  prevArg?: string,
  args: string[] = [],
) => args.includes([prevArg?.toUpperCase(), arg?.toUpperCase()].join(' '))

export const splitQueryByArgs = (
  query: string,
  position: number = 0,
  compositeArgs: string[] = [],
) => {
  const args: [string[], string[]] = [[], []]
  let arg = ''
  let inQuotes = false
  let escapeNextChar = false
  let quoteChar = ''
  let isCursorInQuotes = false
  let lastArg = ''
  let argLeftOffset = 0
  let argRightOffset = 0

  const pushToProperTuple = (isAfterOffset: boolean, arg: string) => {
    lastArg = arg
    isAfterOffset ? args[1].push(arg) : args[0].push(arg)
  }

  const updateLastArgument = (isAfterOffset: boolean, arg: string) => {
    const argsBySide = args[isAfterOffset ? 1 : 0]
    argsBySide[argsBySide.length - 1] =
      `${argsBySide[argsBySide.length - 1]} ${arg}`
  }

  const updateArgOffsets = (left: number, right: number) => {
    argLeftOffset = left
    argRightOffset = right
  }

  for (let i = 0; i < query.length; i++) {
    const char = query[i]
    const isAfterOffset = i >= position + (inQuotes ? -1 : 0)

    if (escapeNextChar) {
      arg += char
      escapeNextChar = !quoteChar
    } else if (char === '\\') {
      escapeNextChar = true
    } else if (inQuotes) {
      if (char === quoteChar) {
        inQuotes = false
        const argWithChar = arg + char

        if (isAfterOffset && !argLeftOffset) {
          updateArgOffsets(i - arg.length, i + 1)
        }

        if (isCompositeArgument(argWithChar, lastArg, compositeArgs)) {
          updateLastArgument(isAfterOffset, argWithChar)
        } else {
          pushToProperTuple(isAfterOffset, argWithChar)
        }

        arg = ''
      } else {
        arg += char
      }
    } else if (char === '"' || char === "'") {
      inQuotes = true
      quoteChar = char
      arg += char
    } else if (char === ' ' || char === '\n') {
      if (arg.length > 0) {
        if (isAfterOffset && !argLeftOffset) {
          updateArgOffsets(i - arg.length, i)
        }

        if (isCompositeArgument(arg, lastArg, compositeArgs)) {
          updateLastArgument(isAfterOffset, arg)
        } else {
          pushToProperTuple(isAfterOffset, arg)
        }

        arg = ''
      }
    } else {
      arg += char
    }

    if (i === position - 1) isCursorInQuotes = inQuotes
  }

  if (arg.length > 0) {
    if (!argLeftOffset)
      updateArgOffsets(query.length - arg.length, query.length)
    pushToProperTuple(true, arg)
  }

  const cursor = {
    isCursorInQuotes,
    prevCursorChar: query[position - 1]?.trim() || '',
    nextCursorChar: query[position]?.trim() || '',
    argLeftOffset,
    argRightOffset,
  }

  return { args, cursor }
}

export const findCompleteQuery = (
  model: monacoEditor.editor.ITextModel,
  position: monacoEditor.Position,
  commandsSpec: ICommands = {},
  commandsArray: string[] = [],
  compositeArgs: string[] = [],
): Nullable<IMonacoQuery> => {
  const { lineNumber } = position
  let commandName = ''
  let fullQuery = ''
  const notCommandRegEx = /^\s|\/\//
  const commandPosition = {
    startLine: 0,
    endLine: 0,
  }

  // find command and args in the previous lines if current line is argument
  // eslint-disable-next-line for-direction
  for (
    let previousLineNumber = lineNumber;
    previousLineNumber > 0;
    previousLineNumber--
  ) {
    commandName = model.getLineContent(previousLineNumber) ?? ''
    const lineBeforePosition =
      previousLineNumber === lineNumber
        ? commandName.slice(0, position.column - 1)
        : commandName
    fullQuery = lineBeforePosition + fullQuery
    commandPosition.startLine = previousLineNumber

    if (!notCommandRegEx.test(commandName)) {
      break
    }

    fullQuery = `\n${fullQuery}`
  }

  const commandCursorPosition = fullQuery.length
  // find args in the next lines
  const linesCount = model.getLineCount()
  for (
    let nextLineNumber = lineNumber;
    nextLineNumber <= linesCount;
    nextLineNumber++
  ) {
    const lineContent = model.getLineContent(nextLineNumber) ?? ''

    if (nextLineNumber !== lineNumber && !notCommandRegEx.test(lineContent)) {
      break
    }

    commandPosition.endLine = nextLineNumber
    const lineAfterPosition =
      nextLineNumber === lineNumber
        ? lineContent.slice(
            position.column - 1,
            model.getLineLength(lineNumber),
          )
        : lineContent

    if (nextLineNumber !== lineNumber) {
      fullQuery += '\n'
    }

    fullQuery += lineAfterPosition
  }

  const { args, cursor } = splitQueryByArgs(
    fullQuery,
    commandCursorPosition,
    compositeArgs,
  )

  const [beforeCursorArgs] = args
  const commandNameFromQuery = isNaN(toNumber(beforeCursorArgs[0]))
    ? beforeCursorArgs[0]
    : beforeCursorArgs[1]
  const matchedCommand = commandsArray.find(
    (command) => commandNameFromQuery?.toUpperCase() === command.toUpperCase(),
  )

  const cursorContext = {
    position,
    fullQuery,
    commandQuery: fullQuery.replace(/^\d+\s+/, ''),
    args,
    allArgs: args.flat(),
    cursor,
  }

  if (isUndefined(matchedCommand)) {
    return cursorContext as IMonacoQuery
  }

  return {
    ...cursorContext,
    commandPosition,
    commandCursorPosition,
    name: matchedCommand,
    info: commandsSpec[matchedCommand],
  } as IMonacoQuery
}

export const findArgIndexByCursor = (
  args: string[] = [],
  fullQuery: string,
  cursorPosition: number,
): Nullable<number> => {
  let argIndex = null
  for (let i = 0; i < args.length; i++) {
    const part = args[i]
    const searchIndex = fullQuery?.indexOf(part) || 0
    if (
      searchIndex < cursorPosition &&
      searchIndex + part.length > cursorPosition
    ) {
      argIndex = i
      break
    }
  }
  return argIndex
}

export const createSyntaxWidget = (text: string, shortcutText: string) => {
  const widget = document.createElement('div')
  const title = document.createElement('span')
  title.classList.add('monaco-widget__title')
  title.innerHTML = text

  const shortcut = document.createElement('span')
  shortcut.classList.add('monaco-widget__shortcut')
  widget.setAttribute('data-testid', 'monaco-widget')
  shortcut.innerHTML = shortcutText

  widget.append(title, shortcut)
  widget.classList.add('monaco-widget')

  return widget
}

export const isParamsLine = (commandInit: string = '') => {
  const command = commandInit.trim()
  return command.startsWith('[') && command.indexOf(']') !== -1
}

const removeParams = (commandInit: string = '') => {
  const command = commandInit.trim()
  const paramsLastIndex = command.indexOf(']')
  return command.substring(paramsLastIndex + 1).trim()
}

export const getMonacoLines = (command: string = '') =>
  command.split(/\n(?=[^\s])/g)

export const getCommandsFromQuery = (
  query: string,
  commandsArray: string[] = [],
) => {
  const commands = getCommandsForExecution(query)
  const [commandLine, ...rest] = commands.map((command = '') => {
    const matchedCommand = commandsArray?.find((commandName) =>
      command.toUpperCase().startsWith(commandName),
    )
    return matchedCommand ?? command.split(' ')?.[0]
  })

  const multiCommands = getMultiCommands(rest).replaceAll('\n', ';')
  const listOfCommands = [commandLine, multiCommands].filter(Boolean)
  return listOfCommands.length ? listOfCommands.join(';') : null
}

export const parseJMESPathFunctions = (functions: TJMESPathFunctions) =>
  Object.entries(functions).map(([label, func]) => {
    const { arguments: args } = func
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
        value: getCommandMarkdown(func as ICommand),
      },
      insertText,
      kind: monacoEditor.languages.CompletionItemKind.Function,
      insertTextRules:
        monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    }
  })
