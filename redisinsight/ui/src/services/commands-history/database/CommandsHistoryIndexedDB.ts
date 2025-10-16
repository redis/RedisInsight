import { AxiosError } from 'axios'
import {
  CommandExecution,
  CommandExecutionType,
  CommandExecutionUI,
} from 'uiSrc/slices/interfaces'
import { CommandsHistoryDatabase, CommandHistoryResult } from './interface'
import { vectorSearchCommandsHistoryStorage } from 'uiSrc/services/vectorSearchHistoryStorage'
import { getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { ApiEndpoints } from 'uiSrc/constants'
import apiService from 'uiSrc/services/apiService'
import { mapCommandExecutionToUI } from '../utils/command-execution.mapper'
import {
  addCommands,
  clearCommands,
  getLocalWbHistory,
  removeCommand,
  wbHistoryStorage,
  WorkbenchStorage,
} from 'uiSrc/services/workbenchStorage'

export class CommandsHistoryIndexedDB implements CommandsHistoryDatabase {
  private readonly dbStorage: WorkbenchStorage

  constructor(commandExecutionType: CommandExecutionType) {
    this.dbStorage =
      commandExecutionType === CommandExecutionType.Search
        ? vectorSearchCommandsHistoryStorage
        : wbHistoryStorage
  }

  async getCommandsHistory(
    instanceId: string,
    _commandExecutionType: CommandExecutionType,
  ): Promise<CommandHistoryResult> {
    const data = await getLocalWbHistory(this.dbStorage, instanceId)
    const results: CommandExecutionUI[] = data.map(mapCommandExecutionToUI)

    return Promise.resolve({
      success: true,
      data: results,
    })
  }

  async addCommandsToHistory(
    instanceId: string,
    commandExecutionType: CommandExecutionType,
    commands: string[],
    options: {
      activeRunQueryMode: string
      resultsMode: string
    },
  ): Promise<CommandHistoryResult> {
    const { activeRunQueryMode, resultsMode } = options

    try {
      const url = getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS)

      const { data, status } = await apiService.post<CommandExecution[]>(url, {
        commands,

        type: commandExecutionType,
        activeRunQueryMode,
        resultsMode,
      })

      if (isStatusSuccessful(status)) {
        const results: CommandExecutionUI[] = data.map(mapCommandExecutionToUI)

        await addCommands(this.dbStorage, data)

        return { success: true, data: results }
      }

      return {
        success: false,
        error: new Error(`Request failed with status ${status}`),
      }
    } catch (exception) {
      return {
        success: false,
        error: exception as AxiosError,
      }
    }
  }

  async deleteCommandFromHistory(
    instanceId: string,
    commandId: string,
  ): Promise<CommandHistoryResult> {
    await removeCommand(this.dbStorage, instanceId, commandId)

    return Promise.resolve({
      success: true,
    })
  }

  async clearCommandsHistory(
    instanceId: string,
  ): Promise<CommandHistoryResult> {
    await clearCommands(this.dbStorage, instanceId)

    return Promise.resolve({
      success: true,
    })
  }
}
