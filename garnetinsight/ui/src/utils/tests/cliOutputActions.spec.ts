import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { cleanup, clearStoreActions, mockedStore } from 'uiSrc/utils/test-utils'
import {
  cliCommandError,
  processUnrepeatableNumber,
  processUnsupportedCommand,
} from 'uiSrc/utils/cliOutputActions'
import { concatToOutput } from 'uiSrc/slices/cli/cli-output'
import { cliParseTextResponseWithOffset } from 'uiSrc/utils'
import { cliTexts } from 'uiSrc/components/messages/cli-output/cliOutput'
import { CommandExecutionStatus } from 'uiSrc/slices/interfaces/cli'
import ApiErrors from 'uiSrc/constants/apiErrors'
import { store } from 'uiSrc/slices/store'
import { processCliClient } from 'uiSrc/slices/cli/cli-settings'

let storeActions: typeof mockedStore
beforeEach(() => {
  cleanup()
  storeActions = cloneDeep(mockedStore)
  storeActions.clearActions()
})

const unsupportedCommands: string[] = ['sync', 'subscription']

jest.mock('uiSrc/slices/store', () => ({
  ...jest.requireActual('uiSrc/slices/store'),
  store: mockedStore,
}))

jest.mock('uiSrc/slices/cli/cli-settings', () => ({
  ...jest.requireActual('uiSrc/slices/cli/cli-settings'),
  cliUnsupportedCommandsSelector: jest
    .fn()
    .mockReturnValue(unsupportedCommands),
}))

describe('processUnsupportedCommand', () => {
  it('should call proper actions', () => {
    const command = 'sync'
    processUnsupportedCommand(command, command)

    const expectedActions = [
      concatToOutput(
        cliParseTextResponseWithOffset(
          cliTexts.CLI_UNSUPPORTED_COMMANDS(
            command,
            unsupportedCommands.join(', '),
          ),
          command,
          CommandExecutionStatus.Fail,
        ),
      ),
    ]
    expect(clearStoreActions(storeActions.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })
})

describe('processUnrepeatableNumber', () => {
  it('should call proper actions', () => {
    const command = 'sync'
    processUnrepeatableNumber(command)

    const expectedActions = [
      concatToOutput(
        cliParseTextResponseWithOffset(
          cliTexts.REPEAT_COUNT_INVALID,
          command,
          CommandExecutionStatus.Fail,
        ),
      ),
    ]
    expect(clearStoreActions(storeActions.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })
})

describe('cliCommandError', () => {
  it('should call proper actions without client uid', () => {
    const command = 'sync'
    const errorMessage = 'error'
    const error = {
      response: {
        status: 500,
        data: { message: errorMessage },
      },
    }
    cliCommandError(error as AxiosError, command)

    const expectedActions = [
      concatToOutput(
        cliParseTextResponseWithOffset(
          errorMessage,
          command,
          CommandExecutionStatus.Fail,
        ),
      ),
    ]
    expect(clearStoreActions(storeActions.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should call proper actions with client uid', () => {
    const command = 'sync'
    const errorMessage = 'error'
    const error = {
      response: {
        status: 500,
        data: { message: errorMessage, name: ApiErrors.ClientNotFound },
      },
    }

    store.getState = jest.fn().mockReturnValue({
      ...mockedStore.getState(),
      cli: { settings: { cliClientUuid: '123' } },
    })

    cliCommandError(error as AxiosError, command)

    const expectedActions = [
      concatToOutput(
        cliParseTextResponseWithOffset(
          cliTexts.CONNECTION_CLOSED,
          command,
          CommandExecutionStatus.Fail,
        ),
      ),
      processCliClient(),
    ]
    expect(clearStoreActions(storeActions.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })
})
