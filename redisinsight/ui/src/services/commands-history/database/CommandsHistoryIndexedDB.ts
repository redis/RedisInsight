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
}
