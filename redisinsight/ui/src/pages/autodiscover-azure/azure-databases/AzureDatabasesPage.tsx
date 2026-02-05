import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { Text } from 'uiSrc/components/base/text'
import { fetchInstancesAction } from 'uiSrc/slices/instances/instances'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import errorMessages from 'uiSrc/components/notifications/error-messages'
import { riToast } from 'uiSrc/components/base/display/toast'
import { defaultContainerId } from 'uiSrc/components/notifications/constants'
import { AppDispatch } from 'uiSrc/slices/store'
import {
  ActionStatus,
  AzureRedisDatabase,
  ImportAzureDatabaseResponse,
} from 'uiSrc/slices/interfaces'
import { azureAuthAccountSelector } from 'uiSrc/slices/oauth/azure'
import {
  addDatabasesAzureAction,
  azureSelector,
  clearDatabasesAzure,
  fetchDatabasesAzure,
} from 'uiSrc/slices/instances/azure'
import AzureDatabases from './AzureDatabases/AzureDatabases'
import { Spacer } from 'uiSrc/components/base/layout'

const groupErrorsByMessage = (
  failedResults: ImportAzureDatabaseResponse[],
  selectedDatabases: AzureRedisDatabase[],
): Record<string, string[]> =>
  failedResults.reduce<Record<string, string[]>>((acc, r) => {
    const db = selectedDatabases.find((db) => db.id === r.id)
    const dbName = db?.name || 'database'
    const errorMessage = r.message || 'Failed to add database'

    if (!acc[errorMessage]) {
      acc[errorMessage] = []
    }
    acc[errorMessage].push(dbName)
    return acc
  }, {})

const renderErrorList = (errorGroups: Record<string, string[]>) =>
  Object.entries(errorGroups).map(([errorMessage, dbNames]) => (
    <React.Fragment key={errorMessage}>
      <div>
        <Text variant="semiBold" component="span">
          {dbNames.join(', ')}
        </Text>{' '}
        - {errorMessage}
      </div>
      <Spacer size="m" />
    </React.Fragment>
  ))

const showErrorToast = (
  failedResults: ImportAzureDatabaseResponse[],
  selectedDatabases: AzureRedisDatabase[],
) => {
  const errorGroups = groupErrorsByMessage(failedResults, selectedDatabases)
  const errorList = renderErrorList(errorGroups)

  riToast(
    errorMessages.DEFAULT(
      <>{errorList}</>,
      () => {},
      `Failed to add ${failedResults.length} database${failedResults.length > 1 ? 's' : ''}`,
    ),
    {
      variant: riToast.Variant.Danger,
      containerId: defaultContainerId,
    },
  )
}

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
    // Redirect to home if not authenticated
    if (!account) {
      history.push(Pages.home)
      return
    }

    // Redirect to subscriptions if no subscription selected
    if (!selectedSubscription) {
      history.push(Pages.azureSubscriptions)
      return
    }

    setTitle('Azure Databases')

    // Only fetch if not already loaded
    if (!loaded.databases) {
      dispatch(
        fetchDatabasesAzure(account.id, selectedSubscription.subscriptionId),
      )
    }
  }, [account, selectedSubscription, loaded.databases])

  const handleBack = () => {
    setSelectedDatabases([])
    history.push(Pages.azureSubscriptions)
  }

  const handleClose = () => {
    history.push(Pages.home)
  }

  const handleSuccess = (successResults: ImportAzureDatabaseResponse[]) => {
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

    if (successResults.length > 0) {
      handleSuccess(successResults)
    }

    if (failedResults.length > 0) {
      showErrorToast(failedResults, selectedDatabases)
    }

    // Only navigate home if all databases were added successfully
    if (successResults.length > 0 && failedResults.length === 0) {
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
