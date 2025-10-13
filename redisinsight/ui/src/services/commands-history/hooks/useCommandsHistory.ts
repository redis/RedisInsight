import {
  CommandExecutionType,
  CommandExecutionUI,
} from 'uiSrc/slices/interfaces'
import { CommandsHistorySQLite } from '../database/CommandsHistorySQLite'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { CommandsHistoryDatabase } from '../database/interface'
import { CommandsHistoryIndexedDB } from '../database/CommandsHistoryIndexedDB'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

interface CommandHistoryProps {
  commandExecutionType: CommandExecutionType
}

interface CommandsHistoryHook {
  getCommandsHistory: (instanceId: string) => Promise<CommandExecutionUI[]>
}

export const useCommandsHistory = ({
  commandExecutionType,
}: CommandHistoryProps): CommandsHistoryHook => {
  let commandsHistoryDatabase: CommandsHistoryDatabase

  const dispatch = useDispatch()
  const { [FeatureFlags.envDependent]: envDependentFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  useEffect(() => {
    if (envDependentFeature?.flag) {
      commandsHistoryDatabase = new CommandsHistorySQLite()
    } else {
      commandsHistoryDatabase = new CommandsHistoryIndexedDB()
    }
  }, [envDependentFeature])

  const getCommandsHistory = async (instanceId: string) => {
    const { data, error } = await commandsHistoryDatabase.getCommandsHistory(
      instanceId,
      commandExecutionType,
    )

    if (error) {
      dispatch(addErrorNotification(error))
    }

    return data || []
  }

  return {
    getCommandsHistory,
  }
}
