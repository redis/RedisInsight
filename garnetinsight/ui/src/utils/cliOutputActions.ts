import { AxiosError } from 'axios'
import {
  cliUnsupportedCommandsSelector,
  updateCliClientAction,
} from 'uiSrc/slices/cli/cli-settings'
import { CommandMonitor } from 'uiSrc/constants'
import { cliParseTextResponseWithOffset } from 'uiSrc/utils/cliHelper'
import {
  cliTexts,
  ConnectionSuccessOutputText,
} from 'uiSrc/components/messages/cli-output/cliOutput'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import { concatToOutput } from 'uiSrc/slices/cli/cli-output'

import { store } from 'uiSrc/slices/store'
import ApiErrors from 'uiSrc/constants/apiErrors'
import { getApiErrorMessage, getApiErrorName } from 'uiSrc/utils/apiResponse'

export function processUnsupportedCommand(
  command: string = '',
  unsupportedCommand: string = '',
  onSuccessAction?: () => void,
) {
  const { getState, dispatch } = store

  const state = getState()
  // Due to requirements, the monitor command should not appear in the list of supported commands
  // That is why we exclude it here
  const unsupportedCommands = cliUnsupportedCommandsSelector(state, [
    CommandMonitor.toLowerCase(),
  ])

  dispatch(
    concatToOutput(
      cliParseTextResponseWithOffset(
        cliTexts.CLI_UNSUPPORTED_COMMANDS(
          command.slice(0, unsupportedCommand.length),
          unsupportedCommands.join(', '),
        ),
        command,
        CommandExecutionStatus.Fail,
      ),
    ),
  )

  onSuccessAction?.()
}

export function processUnrepeatableNumber(
  command: string = '',
  onSuccessAction?: () => void,
) {
  store.dispatch(
    concatToOutput(
      cliParseTextResponseWithOffset(
        cliTexts.REPEAT_COUNT_INVALID,
        command,
        CommandExecutionStatus.Fail,
      ),
    ),
  )

  onSuccessAction?.()
}

export function handleRecreateClient(command = ''): void {
  const { getState, dispatch } = store

  const state = getState()
  const { cliClientUuid } = state.cli.settings

  if (cliClientUuid) {
    dispatch(
      concatToOutput(
        cliParseTextResponseWithOffset(
          cliTexts.CONNECTION_CLOSED,
          command,
          CommandExecutionStatus.Fail,
        ),
      ),
    )
    dispatch(
      updateCliClientAction(
        cliClientUuid,
        () => dispatch(concatToOutput(ConnectionSuccessOutputText)),
        (message: string) =>
          dispatch(
            concatToOutput(
              cliParseTextResponseWithOffset(
                `${message}`,
                command,
                CommandExecutionStatus.Fail,
              ),
            ),
          ),
      ),
    )
  }
}

export function cliCommandError(error: AxiosError, command: string) {
  const { getState, dispatch } = store
  const errorName = getApiErrorName(error)
  const errorMessage = getApiErrorMessage(error)

  const { cliClientUuid } = getState()?.cli?.settings

  if (errorName === ApiErrors.ClientNotFound && cliClientUuid) {
    handleRecreateClient(command)
  } else {
    dispatch(
      concatToOutput(
        cliParseTextResponseWithOffset(
          errorMessage,
          command,
          CommandExecutionStatus.Fail,
        ),
      ),
    )
  }
}
