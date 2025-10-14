import {
  CommandExecutionType,
  CommandExecutionUI,
  ResultsMode,
  RunQueryMode,
} from 'uiSrc/slices/interfaces'
import { CommandsHistorySQLite } from '../database/CommandsHistorySQLite'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useRef, useState } from 'react'
import { CommandsHistoryDatabase } from '../database/interface'
import { CommandsHistoryIndexedDB } from '../database/CommandsHistoryIndexedDB'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

interface CommandHistoryProps {
  commandExecutionType: CommandExecutionType
}

interface CommandsHistoryHook {
  getCommandsHistory: (instanceId: string) => Promise<CommandExecutionUI[]>

  addCommandsToHistory: (
    instanceId: string,
    commandExecutionType: CommandExecutionType,
    commands: string[],
    options: {
      activeRunQueryMode: RunQueryMode
      resultsMode: ResultsMode
    },
  ) => Promise<CommandExecutionUI[]>
}

export const useCommandsHistory = ({
  commandExecutionType,
}: CommandHistoryProps): CommandsHistoryHook => {
  const commandsHistoryDatabaseRef = useRef<CommandsHistoryDatabase>()

  const dispatch = useDispatch()
  const { [FeatureFlags.envDependent]: envDependentFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  useEffect(() => {
    if (envDependentFeature?.flag) {
      commandsHistoryDatabaseRef.current = new CommandsHistorySQLite()
    } else {
      commandsHistoryDatabaseRef.current = new CommandsHistoryIndexedDB()
    }
  }, [envDependentFeature])

  const getCommandsHistory = async (instanceId: string) => {
    if (!commandsHistoryDatabaseRef.current) {
      return []
    }

    const { data, error } =
      await commandsHistoryDatabaseRef.current.getCommandsHistory(
        instanceId,
        commandExecutionType,
      )

    if (error) {
      dispatch(addErrorNotification(error))
    }

    return data || []
  }

  const addCommandsToHistory = async (
    instanceId: string,
    commandExecutionType: CommandExecutionType,
    commands: string[],
    options: {
      activeRunQueryMode: RunQueryMode
      resultsMode: ResultsMode
    },
  ) => {
    if (!commandsHistoryDatabaseRef.current) {
      return []
    }

    const { success, error, data } =
      await commandsHistoryDatabaseRef.current.addCommandsToHistory(
        instanceId,
        commandExecutionType,
        commands,
        options,
      )

    if (error) {
      dispatch(addErrorNotification(error))
    }

    return success && data ? data : []
  }

  return {
    getCommandsHistory,
    addCommandsToHistory,
  }
}
