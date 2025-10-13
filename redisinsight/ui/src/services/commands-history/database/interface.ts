import { AxiosError } from 'axios'
import {
  CommandExecutionType,
  CommandExecutionUI,
} from 'uiSrc/slices/interfaces'

export interface CommandsHistoryDatabase {
  getCommandsHistory(
    instanceId: string,
    commandExecutionType: CommandExecutionType,
  ): Promise<CommandHistoryResult>
}

export interface CommandHistoryResult {
  success: boolean
  data?: CommandExecutionUI[]
  error?: Error | AxiosError | any
}
