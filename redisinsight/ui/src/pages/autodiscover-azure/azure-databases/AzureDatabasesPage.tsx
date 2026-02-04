import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { fetchInstancesAction } from 'uiSrc/slices/instances/instances'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import errorMessages from 'uiSrc/components/notifications/error-messages'
import { riToast } from 'uiSrc/components/base/display/toast'
import { defaultContainerId } from 'uiSrc/components/notifications/constants'
import { AppDispatch } from 'uiSrc/slices/store'
import { useAzureAutodiscovery } from '../contexts'
import AzureDatabases from './AzureDatabases/AzureDatabases'

const AzureDatabasesPage = () => {
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const {
    databasesLoading,
    databasesError,
    databases,
    selectedSubscription,
    selectedDatabases,
    fetchDatabases,
    setSelectedDatabases,
    addDatabases,
  } = useAzureAutodiscovery()

  useEffect(() => {
    setTitle('Azure Databases')

    if (!selectedSubscription) {
      history.push(Pages.azureSubscriptions)
      return
    }

    fetchDatabases()
  }, [selectedSubscription])

  const handleBack = () => {
    setSelectedDatabases([])
    history.push(Pages.azureSubscriptions)
  }

  const handleClose = () => {
    history.push(Pages.home)
  }

  const handleSubmit = async () => {
    const results = await addDatabases()

    const successResults = results.filter((r) => r.success)
    const failedResults = results.filter((r) => !r.success)

    // Refresh instances list if any were added
    if (successResults.length > 0) {
      dispatch(fetchInstancesAction())
      dispatch(
        addMessageNotification(
          successMessages.ADDED_NEW_INSTANCE(
            successResults.length > 1
              ? `${successResults.length} databases`
              : successResults[0]?.database?.name || 'Database',
          ),
        ),
      )
    }

    // Show single grouped error toast for all failed databases
    if (failedResults.length > 0) {
      const failedNames = failedResults
        .map((r) => r.database?.name || 'database')
        .join(', ')

      console.log(JSON.stringify(failedResults, null, 2))
      // Get the first error message to show as main message
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

  return (
    <AzureDatabases
      databases={databases}
      selectedDatabases={selectedDatabases}
      subscriptionName={selectedSubscription?.displayName || ''}
      loading={databasesLoading}
      error={databasesError}
      onBack={handleBack}
      onClose={handleClose}
      onSubmit={handleSubmit}
      onSelectionChange={setSelectedDatabases}
    />
  )
}

export default AzureDatabasesPage
