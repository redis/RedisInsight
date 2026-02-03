import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { fetchInstancesAction } from 'uiSrc/slices/instances/instances'
import { addMessageNotification } from 'uiSrc/slices/app/notifications'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { AppDispatch } from 'uiSrc/slices/store'
import { useAzureAutodiscovery } from '../contexts'
import AzureDatabases from './AzureDatabases/AzureDatabases'

const AzureDatabasesPage = () => {
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const {
    loading,
    error,
    databases,
    selectedSubscription,
    selectedDatabases,
    fetchDatabases,
    setSelectedDatabases,
    addDatabases,
    reset,
  } = useAzureAutodiscovery()

  useEffect(() => {
    setTitle('Azure Databases')

    if (!selectedSubscription) {
      history.push(Pages.azureSubscriptions)
      return
    }

    fetchDatabases(selectedSubscription.subscriptionId)
  }, [selectedSubscription])

  const handleBack = () => {
    setSelectedDatabases([])
    history.push(Pages.azureSubscriptions)
  }

  const handleClose = () => {
    reset()
    history.push(Pages.home)
  }

  const handleSubmit = async () => {
    const success = await addDatabases()
    if (success) {
      dispatch(fetchInstancesAction())
      dispatch(
        addMessageNotification(
          successMessages.ADDED_NEW_INSTANCE(
            selectedDatabases.length > 1
              ? `${selectedDatabases.length} databases`
              : selectedDatabases[0]?.name || 'Database',
          ),
        ),
      )
      reset()
      history.push(Pages.home)
    }
  }

  return (
    <AzureDatabases
      databases={databases}
      selectedDatabases={selectedDatabases}
      subscriptionName={selectedSubscription?.displayName || ''}
      loading={loading}
      error={error}
      onBack={handleBack}
      onClose={handleClose}
      onSubmit={handleSubmit}
      onSelectionChange={setSelectedDatabases}
    />
  )
}

export default AzureDatabasesPage
