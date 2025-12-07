import { AxiosError } from 'axios'
import {
  CommandExecutionType,
  CommandExecutionUI,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'

export interface CommandsHistoryDatabase {
  getCommandsHistory(
    instanceId: string,
    commandExecutionType: CommandExecutionType,
  ): Promise<CommandsHistoryResult>

  getCommandHistory(
    instanceId: string,
    commandId: string,
  ): Promise<CommandHistoryResult>

  addCommandsToHistory(
    instanceId: string,
    commandExecutionType: CommandExecutionType,
    commands: string[],
    options: {
      activeRunQueryMode: RunQueryMode
      resultsMode: ResultsMode
    },
  ): Promise<CommandsHistoryResult>

  deleteCommandFromHistory(
    instanceId: string,
    commandId: string,
  ): Promise<CommandsHistoryResult>

  clearCommandsHistory(
    instanceId: string,
    commandExecutionType: CommandExecutionType,
  ): Promise<CommandsHistoryResult>
}

export interface CommandsHistoryResult {
  success: boolean
  data?: CommandExecutionUI[]
  error?: Error | AxiosError | any
}

export interface CommandHistoryResult {
  success: boolean
  data?: CommandExecutionUI
  error?: Error | AxiosError | any
}
