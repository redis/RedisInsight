import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { fetchInstancesAction } from 'uiSrc/slices/instances/instances'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import errorMessages from 'uiSrc/components/notifications/error-messages'
import { riToast } from 'uiSrc/components/base/display/toast'
import { defaultContainerId } from 'uiSrc/components/notifications/constants'
import { AppDispatch } from 'uiSrc/slices/store'
import { ActionStatus, AzureRedisDatabase } from 'uiSrc/slices/interfaces'
import { azureAuthAccountSelector } from 'uiSrc/slices/oauth/azure'
import {
  addDatabasesAzureAction,
  azureSelector,
  clearDatabasesAzure,
  fetchDatabasesAzure,
} from 'uiSrc/slices/instances/azure'
import AzureDatabases from './AzureDatabases/AzureDatabases'

const AzureDatabasesPage = () => {
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const account = useSelector(azureAuthAccountSelector)
  const { loading, error, databases, selectedSubscription, loaded } =
    useSelector(azureSelector)

  // Local state for selected databases (UI state)
  const [selectedDatabases, setSelectedDatabases] = useState<
    AzureRedisDatabase[]
  >([])

  useEffect(() => {
    setTitle('Azure Databases')

    if (!selectedSubscription) {
      history.push(Pages.azureSubscriptions)
      return
    }

    // Only fetch if not already loaded
    if (account?.id && !loaded.databases) {
      dispatch(
        fetchDatabasesAzure(account.id, selectedSubscription.subscriptionId),
      )
    }
  }, [selectedSubscription, account?.id, loaded.databases])

  const handleBack = () => {
    setSelectedDatabases([])
    history.push(Pages.azureSubscriptions)
  }

  const handleClose = () => {
    history.push(Pages.home)
  }

  const handleSubmit = async () => {
    if (!account?.id || selectedDatabases.length === 0) {
      return
    }

    const databaseIds = selectedDatabases.map((db) => db.id)
    const results = await dispatch(
      addDatabasesAzureAction(account.id, databaseIds),
    )

    const successResults = results.filter(
      (r) => r.status === ActionStatus.Success,
    )
    const failedResults = results.filter((r) => r.status === ActionStatus.Fail)

    // Refresh instances list if any were added
    if (successResults.length > 0) {
      dispatch(fetchInstancesAction())

      const successDb = selectedDatabases.find(
        (db) => db.id === successResults[0]?.id,
      )
      dispatch(
        addMessageNotification(
          successMessages.ADDED_NEW_INSTANCE(
            successResults.length > 1
              ? `${successResults.length} databases`
              : successDb?.name || 'Database',
          ),
        ),
      )
    }

    // Show single grouped error toast for all failed databases
    if (failedResults.length > 0) {
      const failedNames = failedResults
        .map((r) => {
          const db = selectedDatabases.find((db) => db.id === r.id)
          return db?.name || 'database'
        })
        .join(', ')

      const firstErrorMessage =
        failedResults[0]?.message || 'Failed to add database'

      riToast(
        errorMessages.DEFAULT(
          failedResults.length === 1
            ? firstErrorMessage
            : `${failedResults.length} databases failed. ${firstErrorMessage}`,
          () => {},
          `Failed to add: ${failedNames}`,
        ),
        {
          variant: riToast.Variant.Danger,
          containerId: defaultContainerId,
        },
      )
    }

    // Navigate home if at least one database was added successfully
    if (successResults.length > 0) {
      history.push(Pages.home)
    }
  }

  const handleRefresh = () => {
    if (account?.id && selectedSubscription) {
      dispatch(clearDatabasesAzure())
      dispatch(
        fetchDatabasesAzure(account.id, selectedSubscription.subscriptionId),
      )
      setSelectedDatabases([])
    }
  }

  return (
    <AzureDatabases
      databases={databases || []}
      selectedDatabases={selectedDatabases}
      subscriptionName={selectedSubscription?.displayName || ''}
      loading={loading}
      error={error}
      onBack={handleBack}
      onClose={handleClose}
      onSubmit={handleSubmit}
      onSelectionChange={setSelectedDatabases}
      onRefresh={handleRefresh}
    />
  )
}

export default AzureDatabasesPage
