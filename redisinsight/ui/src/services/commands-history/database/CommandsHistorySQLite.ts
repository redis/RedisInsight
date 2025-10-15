import { AxiosError } from 'axios'

import apiService from 'uiSrc/services/apiService'
import { ApiEndpoints } from 'uiSrc/constants'
import { getUrl, isStatusSuccessful } from 'uiSrc/utils'
import {
  CommandExecution,
  CommandExecutionType,
  CommandExecutionUI,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'

import { mapCommandExecutionToUI } from '../utils/command-execution.mapper'
import { CommandsHistoryDatabase, CommandHistoryResult } from './interface'

export class CommandsHistorySQLite implements CommandsHistoryDatabase {
  async getCommandsHistory(
    instanceId: string,
    commandExecutionType: CommandExecutionType,
  ): Promise<CommandHistoryResult> {
    try {
      const url = getUrl(instanceId, ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS)
      const config = { params: { type: commandExecutionType } }

      const { data, status } = await apiService.get<CommandExecution[]>(
        url,
        config,
      )

      if (isStatusSuccessful(status)) {
        const results: CommandExecutionUI[] = data.map(mapCommandExecutionToUI)

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

  async addCommandsToHistory(
    instanceId: string,
    commandExecutionType: CommandExecutionType,
    commands: string[],
    options: {
      activeRunQueryMode: RunQueryMode
      resultsMode: ResultsMode
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
    try {
      const url = getUrl(
        instanceId,
        ApiEndpoints.WORKBENCH_COMMAND_EXECUTIONS,
        commandId,
      )

      const { status } = await apiService.delete<CommandExecution>(url)

      if (isStatusSuccessful(status)) {
        return { success: true }
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
}
