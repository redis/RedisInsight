import { isNaN } from 'lodash'
import { monaco as monacoEditor } from 'react-monaco-editor'
import { ICommand, ICommands } from 'uiSrc/constants'
import {
  generateArgsNames,
  generateArgsForInsertText,
  getCommandMarkdown,
  getDocUrlForCommand,
} from 'uiSrc/utils/commands'

type DependencyProposals = {
  [key: string]: monacoEditor.languages.CompletionItem
}

export const createDependencyProposals = (
  commandsSpec: ICommands,
): DependencyProposals => {
  const result: DependencyProposals = {}
  const commandsArr = Object.keys(commandsSpec).sort()
  commandsArr.forEach((command: string) => {
    const commandInfo: ICommand = commandsSpec[command]
    const range = {
      startLineNumber: 0,
      endLineNumber: 0,
      startColumn: 0,
      endColumn: 0,
    }
    const commandArgs = commandInfo?.arguments || []
    const detail: string = `${command} ${generateArgsNames(commandInfo?.provider, commandArgs).join(' ')}`
    const argsNames = generateArgsNames(
      commandInfo?.provider,
      commandArgs,
      false,
      true,
    )
    const insertText = `${command} ${generateArgsForInsertText(argsNames)}`

    result[command] = {
      label: command,
      kind: monacoEditor.languages.CompletionItemKind.Function,
      detail,
      insertText,
      documentation: {
        value: getCommandMarkdown(
          commandsSpec[command],
          getDocUrlForCommand(command),
        ),
      },
      insertTextRules:
        monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
    }
  })

  return result
}

export const getRedisCompletionProvider = (
  commandsSpec: ICommands,
): monacoEditor.languages.CompletionItemProvider => {
  // generate completion item for each redis command
  const dependencyProposals = createDependencyProposals(commandsSpec)
  const commandsArr = Object.keys(commandsSpec).sort()

  return {
    provideCompletionItems: (
      model: monacoEditor.editor.IModel,
      position: monacoEditor.Position,
    ): monacoEditor.languages.CompletionList => {
      const word = model.getWordUntilPosition(position)
      const line = model.getLineContent(position.lineNumber)
      const indexOfSpace = line.indexOf(' ')

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        endColumn: word.endColumn,
        startColumn:
          word.startColumn > indexOfSpace &&
          !isNaN(+line.slice(0, indexOfSpace))
            ? indexOfSpace + 2
            : 1,
      }

      // display suggestions only for words that don't belong to a folding area
      if (!model.getValueInRange(range).startsWith(' ')) {
        return {
          suggestions: commandsArr.map((command: string) => ({
            ...dependencyProposals[command],
            range,
          })),
        }
      }
      return { suggestions: [] }
    },
  }
}
