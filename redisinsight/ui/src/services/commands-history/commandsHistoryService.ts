import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { store } from 'uiSrc/slices/store'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import {
  CommandExecutionType,
  CommandExecutionUI,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'

import { CommandsHistorySQLite } from './database/CommandsHistorySQLite'
import { CommandsHistoryDatabase } from './database/interface'
import { CommandsHistoryIndexedDB } from './database/CommandsHistoryIndexedDB'

export class CommandsHistoryService {
  private commandsHistoryDatabase: CommandsHistoryDatabase

  private commandExecutionType: CommandExecutionType

  constructor(commandExecutionType: CommandExecutionType) {
    this.commandExecutionType = commandExecutionType
    this.commandsHistoryDatabase = this.initializeDatabase()
  }

  private initializeDatabase(): CommandsHistoryDatabase {
    const state = store.getState()
    const { [FeatureFlags.envDependent]: envDependentFeature } =
      appFeatureFlagsFeaturesSelector(state)

    if (envDependentFeature?.flag) {
      return new CommandsHistorySQLite()
    } else {
      return new CommandsHistoryIndexedDB(this.commandExecutionType)
    }
  }

  async getCommandsHistory(instanceId: string): Promise<CommandExecutionUI[]> {
    const { data, error } =
      await this.commandsHistoryDatabase.getCommandsHistory(
        instanceId,
        this.commandExecutionType,
      )

    if (error) {
      store.dispatch(addErrorNotification(error))
    }

    return data || []
  }

  async getCommandHistory(
    instanceId: string,
    commandId: string,
  ): Promise<CommandExecutionUI | null> {
    const { data, error } =
      await this.commandsHistoryDatabase.getCommandHistory(
        instanceId,
        commandId,
      )

    if (error) {
      store.dispatch(addErrorNotification(error))
    }

    return data || null
  }

  async addCommandsToHistory(
    instanceId: string,
    commands: string[],
    options: {
      activeRunQueryMode: RunQueryMode
      resultsMode: ResultsMode
    },
  ): Promise<CommandExecutionUI[]> {
    const { success, error, data } =
      await this.commandsHistoryDatabase.addCommandsToHistory(
        instanceId,
        this.commandExecutionType,
        commands,
        options,
      )

    if (error) {
      store.dispatch(addErrorNotification(error))
    }

    return success && data ? data : []
  }

  async deleteCommandFromHistory(
    instanceId: string,
    commandId: string,
  ): Promise<void> {
    const { error } =
      await this.commandsHistoryDatabase.deleteCommandFromHistory(
        instanceId,
        commandId,
      )

    if (error) {
      store.dispatch(addErrorNotification(error))
    }
  }

  async clearCommandsHistory(instanceId: string): Promise<void> {
    const { error } = await this.commandsHistoryDatabase.clearCommandsHistory(
      instanceId,
      this.commandExecutionType,
    )

    if (error) {
      store.dispatch(addErrorNotification(error))
    }
  }
}

export default CommandsHistoryService
