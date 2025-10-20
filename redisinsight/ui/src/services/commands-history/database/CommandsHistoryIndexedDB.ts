import { AxiosError } from 'axios'
import {
  CommandExecution,
  CommandExecutionType,
  CommandExecutionUI,
} from 'uiSrc/slices/interfaces'
import {
  CommandHistoryResult,
  CommandsHistoryDatabase,
  CommandsHistoryResult,
} from './interface'
import { vectorSearchCommandsHistoryStorage } from 'uiSrc/services/vectorSearchHistoryStorage'
import { getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { ApiEndpoints } from 'uiSrc/constants'
import apiService from 'uiSrc/services/apiService'
import { mapCommandExecutionToUI } from '../utils/command-execution.mapper'
import {
  addCommands,
  clearCommands,
  findCommand,
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
  ): Promise<CommandsHistoryResult> {
    const data = await getLocalWbHistory(this.dbStorage, instanceId)
    const results: CommandExecutionUI[] = data.map(mapCommandExecutionToUI)

    return Promise.resolve({
      success: true,
      data: results,
    })
  }

  async getCommandHistory(
    _instanceId: string,
    commandId: string,
  ): Promise<CommandHistoryResult> {
    const command = await findCommand(this.dbStorage, commandId)

    if (!command) {
      return {
        success: false,
      }
    }

    return {
      success: true,
      data: mapCommandExecutionToUI(command as CommandExecution),
    }
  }

  async addCommandsToHistory(
    instanceId: string,
    commandExecutionType: CommandExecutionType,
    commands: string[],
    options: {
      activeRunQueryMode: string
      resultsMode: string
    },
  ): Promise<CommandsHistoryResult> {
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
  ): Promise<CommandsHistoryResult> {
    await removeCommand(this.dbStorage, instanceId, commandId)

    return Promise.resolve({
      success: true,
    })
  }

  async clearCommandsHistory(
    instanceId: string,
  ): Promise<CommandsHistoryResult> {
    await clearCommands(this.dbStorage, instanceId)

    return Promise.resolve({
      success: true,
    })
  }
}
