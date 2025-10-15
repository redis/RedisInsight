import { CommandExecutionType } from 'uiSrc/slices/interfaces'
import { CommandsHistoryDatabase, CommandHistoryResult } from './interface'

export class CommandsHistoryIndexedDB implements CommandsHistoryDatabase {
  async getCommandsHistory(
    instanceId: string,
    commandExecutionType: CommandExecutionType,
  ): Promise<CommandHistoryResult> {
    // TODO: Implementation for fetching command history from IndexedDB
    return Promise.resolve({
      success: true,
      data: [],
    })
  }

  async addCommandsToHistory(
    instanceId: string,
    commandExecutionType: CommandExecutionType,
    commands: string[],
  ): Promise<CommandHistoryResult> {
    // TODO: Implementation for adding command to IndexedDB
    // For now, just return success as IndexedDB implementation is not complete
    return Promise.resolve({
      success: true,
      data: [],
    })
  }

  async deleteCommandFromHistory(
    instanceId: string,
    commandId: string,
  ): Promise<CommandHistoryResult> {
    // TODO: Implementation for deleting command from IndexedDB
    return Promise.resolve({
      success: true,
    })
  }

  async clearCommandsHistory(
    instanceId: string,
  ): Promise<CommandHistoryResult> {
    // TODO: Implementation for clearing command history from IndexedDB
    return Promise.resolve({
      success: true,
    })
  }
}
