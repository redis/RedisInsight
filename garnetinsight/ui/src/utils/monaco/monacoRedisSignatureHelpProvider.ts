import { MutableRefObject } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'
import { isNull } from 'lodash'
import { ICommands } from 'uiSrc/constants'
import { findCommandEarlier } from 'uiSrc/utils'
import { generateArgsNames } from 'uiSrc/utils/commands'

export const getRedisSignatureHelpProvider = (
  commandsSpec: ICommands,
  commandsArray: string[],
  isBlockedRef?: MutableRefObject<boolean>,
): monacoEditor.languages.SignatureHelpProvider =>
  // generate signature help provider
  ({
    // signatureHelpTriggerCharacters: [' '],
    // signatureHelpRetriggerCharacters: [' '],
    provideSignatureHelp: (
      model: monacoEditor.editor.IModel,
      position: monacoEditor.Position,
    ) => {
      const command = findCommandEarlier(
        model,
        position,
        commandsSpec,
        commandsArray,
      )

      if (isNull(command) || isBlockedRef?.current) {
        return null
      }

      const commandArgs = command.info?.arguments ?? []
      const label: string = `${command?.name} ${generateArgsNames(command.info?.provider, commandArgs).join(' ')}`

      return {
        dispose: () => {},
        value: {
          activeParameter: 0,
          activeSignature: 0,
          signatures: [
            {
              label,
              parameters: [{ label: `${command?.name}` }],
            },
          ],
        },
      }
    },
  })
