import { monaco as monacoEditor } from 'react-monaco-editor'
import { isNumber } from 'lodash'
import { IMonacoQuery, Nullable, splitQueryByArgs } from 'uiSrc/utils'
import {
  CursorContext,
  FoundCommandArgument,
} from 'uiSrc/pages/workbench/types'
import { IRedisCommand } from 'uiSrc/constants'
import {
  asSuggestionsRef,
  getFieldsSuggestions,
  getFunctionsSuggestions,
  getGeneralSuggestions,
  getIndexesSuggestions,
  getNoIndexesSuggestion,
} from 'uiSrc/pages/workbench/utils/suggestions'
import {
  COMMANDS_WITHOUT_INDEX_PROPOSE,
  DefinedArgumentName,
  FIELD_START_SYMBOL,
  ModuleCommandPrefix,
} from 'uiSrc/pages/workbench/constants'
import { findSuggestionsByQueryArgs } from 'uiSrc/pages/workbench/utils/query'

export const findSuggestionsByArg = (
  listOfCommands: IRedisCommand[],
  command: IMonacoQuery,
  cursorContext: CursorContext,
  additionData: {
    indexes?: any[]
    fields?: any[]
  },
  isEscaped: boolean = false,
): {
  suggestions: any
  helpWidget?: any
} => {
  const { allArgs, args, cursor } = command
  const { prevCursorChar } = cursor
  const [beforeOffsetArgs, [currentOffsetArg]] = args

  const startCommentIndex = beforeOffsetArgs.findIndex((el) =>
    el.startsWith('//'),
  )
  if (startCommentIndex > -1 || currentOffsetArg?.startsWith('//')) {
    return {
      suggestions: asSuggestionsRef([]),
      helpWidget: { isOpen: false },
    }
  }

  const foundArg = findSuggestionsByQueryArgs(listOfCommands, beforeOffsetArgs)

  if (!command.name.startsWith(ModuleCommandPrefix.RediSearch)) {
    return {
      helpWidget: {
        isOpen: !!foundArg,
        data: { parent: foundArg?.parent, currentArg: foundArg?.stopArg },
      },
      suggestions: asSuggestionsRef([]),
    }
  }

  if (
    prevCursorChar === FIELD_START_SYMBOL ||
    currentOffsetArg?.startsWith(FIELD_START_SYMBOL)
  ) {
    return handleFieldSuggestions(
      additionData.fields || [],
      foundArg,
      cursorContext.range,
    )
  }

  if (foundArg?.stopArg?.token && !foundArg?.isBlocked) {
    return handleCommonSuggestions(
      command.commandQuery,
      foundArg,
      allArgs,
      additionData.fields || [],
      cursorContext,
      isEscaped,
    )
  }

  const { indexes, fields } = additionData
  switch (foundArg?.stopArg?.name) {
    case DefinedArgumentName.index: {
      return handleIndexSuggestions(
        indexes,
        command,
        foundArg,
        currentOffsetArg,
        cursorContext,
      )
    }
    case DefinedArgumentName.query: {
      return handleQuerySuggestions(foundArg)
    }
    default: {
      return handleCommonSuggestions(
        command.commandQuery,
        foundArg,
        allArgs,
        fields,
        cursorContext,
        isEscaped,
      )
    }
  }
}

const handleFieldSuggestions = (
  fields: any[],
  foundArg: Nullable<FoundCommandArgument>,
  range: monacoEditor.IRange,
) => {
  const isInQuery = foundArg?.stopArg?.name === DefinedArgumentName.query
  const fieldSuggestions = getFieldsSuggestions(fields, range, true, isInQuery)
  return {
    suggestions: asSuggestionsRef(fieldSuggestions, true),
  }
}

const handleIndexSuggestions = (
  indexes: any[] = [],
  command: IMonacoQuery,
  foundArg: FoundCommandArgument,
  currentOffsetArg: Nullable<string>,
  cursorContext: CursorContext,
) => {
  const isIndex = indexes.length > 0
  const helpWidget = {
    isOpen: isIndex,
    data: { parent: foundArg.parent, currentArg: foundArg?.stopArg },
  }
  const currentCommand = command.info

  if (COMMANDS_WITHOUT_INDEX_PROPOSE.includes(command.name || '')) {
    return {
      suggestions: asSuggestionsRef([]),
      helpWidget,
    }
  }

  if (!isIndex) {
    helpWidget.isOpen = !!currentOffsetArg

    return {
      suggestions: asSuggestionsRef(
        !currentOffsetArg ? getNoIndexesSuggestion(cursorContext.range) : [],
        true,
      ),
      helpWidget,
    }
  }

  if (!isIndex || currentOffsetArg) {
    return {
      suggestions: asSuggestionsRef([], !currentOffsetArg),
      helpWidget,
    }
  }

  const argumentIndex = currentCommand?.arguments?.findIndex(
    ({ name }) => foundArg?.stopArg?.name === name,
  )
  const isNextArgQuery =
    isNumber(argumentIndex) &&
    currentCommand?.arguments?.[argumentIndex + 1]?.name ===
      DefinedArgumentName.query

  return {
    suggestions: asSuggestionsRef(
      getIndexesSuggestions(indexes, cursorContext.range, isNextArgQuery),
    ),
    helpWidget,
  }
}

const handleQuerySuggestions = (foundArg: FoundCommandArgument) => ({
  helpWidget: {
    isOpen: true,
    data: { parent: foundArg?.parent, currentArg: foundArg?.stopArg },
  },
  suggestions: asSuggestionsRef([], false),
})

const handleExpressionSuggestions = (
  value: string,
  foundArg: FoundCommandArgument,
  cursorContext: CursorContext,
) => {
  const helpWidget = {
    isOpen: true,
    data: { parent: foundArg?.parent, currentArg: foundArg?.stopArg },
  }

  const { isCursorInQuotes, offset, argLeftOffset } = cursorContext
  if (!isCursorInQuotes) {
    return {
      suggestions: asSuggestionsRef([]),
      helpWidget,
    }
  }

  const stringBeforeCursor = value.substring(argLeftOffset, offset) || ''
  const expression = stringBeforeCursor.replace(/^["']|["']$/g, '')
  const { args } = splitQueryByArgs(expression, offset - argLeftOffset)
  const [, [currentArg]] = args

  const functions = foundArg?.stopArg?.arguments ?? []
  const suggestions = getFunctionsSuggestions(functions, cursorContext.range)
  const isStartsWithFunction = functions.some(({ token }) =>
    token?.startsWith(currentArg),
  )

  return {
    suggestions: asSuggestionsRef(suggestions, true, isStartsWithFunction),
    helpWidget,
  }
}

const handleCommonSuggestions = (
  value: string,
  foundArg: Nullable<FoundCommandArgument>,
  allArgs: string[],
  fields: any[] = [],
  cursorContext: CursorContext,
  isEscaped: boolean,
) => {
  if (foundArg?.stopArg?.expression && foundArg.isBlocked) {
    return handleExpressionSuggestions(value, foundArg, cursorContext)
  }

  const { prevCursorChar, nextCursorChar, isCursorInQuotes } = cursorContext
  const shouldHideSuggestions =
    isCursorInQuotes || nextCursorChar || (prevCursorChar && isEscaped)
  if (shouldHideSuggestions) {
    return {
      helpWidget: {
        isOpen: !!foundArg,
        data: { parent: foundArg?.parent, currentArg: foundArg?.stopArg },
      },
      suggestions: asSuggestionsRef([]),
    }
  }

  const { suggestions, forceHide, helpWidgetData } = getGeneralSuggestions(
    foundArg,
    allArgs,
    cursorContext.range,
    fields,
  )

  return {
    suggestions: asSuggestionsRef(suggestions, forceHide),
    helpWidget: helpWidgetData,
  }
}
