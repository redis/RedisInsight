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
  ): Promise<CommandHistoryResult>

  addCommandsToHistory(
    instanceId: string,
    commandExecutionType: CommandExecutionType,
    commands: string[],
    options: {
      activeRunQueryMode: RunQueryMode
      resultsMode: ResultsMode
    },
  ): Promise<CommandHistoryResult>

  deleteCommandFromHistory(
    instanceId: string,
    commandId: string,
  ): Promise<CommandHistoryResult>
}

export interface CommandHistoryResult {
  success: boolean
  data?: CommandExecutionUI[]
  error?: Error | AxiosError | any
}
