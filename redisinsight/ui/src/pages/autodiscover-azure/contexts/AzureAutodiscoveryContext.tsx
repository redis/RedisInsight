import React, { createContext, useContext, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { AxiosError } from 'axios'

import { apiService, instancesService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { azureAuthAccountSelector } from 'uiSrc/slices/oauth/azure'
import {
  AzureSubscription,
  AzureRedisDatabase,
  AzureConnectionDetails,
  AzureProviderDetails,
  CloudProvider,
  ConnectionProvider,
} from 'uiSrc/slices/interfaces'

interface AddDatabaseResult {
  database: AzureRedisDatabase
  success: boolean
  message?: string
}

export interface AzureAutodiscoveryContextType {
  // Subscriptions
  subscriptions: AzureSubscription[]
  selectedSubscription: AzureSubscription | null
  subscriptionsLoading: boolean
  subscriptionsError: string
  fetchSubscriptions: () => Promise<void>
  selectSubscription: (subscription: AzureSubscription) => void

  // Databases
  databases: AzureRedisDatabase[]
  selectedDatabases: AzureRedisDatabase[]
  databasesLoading: boolean
  databasesError: string
  addedDatabases: AddDatabaseResult[]
  fetchDatabases: () => Promise<void>
  setSelectedDatabases: (databases: AzureRedisDatabase[]) => void
  addDatabases: () => Promise<boolean>
}

const AzureAutodiscoveryContext = createContext<
  AzureAutodiscoveryContextType | undefined
>(undefined)

export const AzureAutodiscoveryProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const account = useSelector(azureAuthAccountSelector)

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<AzureSubscription[]>([])
  const [selectedSubscription, setSelectedSubscription] =
    useState<AzureSubscription | null>(null)
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true)
  const [subscriptionsError, setSubscriptionsError] = useState('')

  // Databases state
  const [databases, setDatabases] = useState<AzureRedisDatabase[]>([])
  const [selectedDatabases, setSelectedDatabases] = useState<
    AzureRedisDatabase[]
  >([])
  const [databasesLoading, setDatabasesLoading] = useState(false)
  const [databasesError, setDatabasesError] = useState('')
  const [addedDatabases, setAddedDatabases] = useState<AddDatabaseResult[]>([])

  const fetchSubscriptions = async () => {
    if (!account?.id) {
      setSubscriptionsError('No Azure account found')
      return
    }

    setSubscriptionsLoading(true)
    setSubscriptionsError('')

    try {
      const { data, status } = await apiService.get<AzureSubscription[]>(
        ApiEndpoints.AZURE_SUBSCRIPTIONS,
        { params: { accountId: account.id } },
      )

      if (isStatusSuccessful(status)) {
        setSubscriptions(data)
      }
    } catch (error) {
      setSubscriptionsError(getApiErrorMessage(error as AxiosError))
    } finally {
      setSubscriptionsLoading(false)
    }
  }

  const selectSubscription = (subscription: AzureSubscription) => {
    setSelectedSubscription(subscription)
    // Reset databases when subscription changes
    setDatabases([])
    setSelectedDatabases([])
    setDatabasesError('')
  }

  const fetchDatabases = async () => {
    if (!account?.id || !selectedSubscription) {
      setDatabasesError('No subscription selected')
      return
    }

    setDatabasesLoading(true)
    setDatabasesError('')

    try {
      const { data, status } = await apiService.get<AzureRedisDatabase[]>(
        `${ApiEndpoints.AZURE_DATABASES}/${selectedSubscription.subscriptionId}/databases`,
        { params: { accountId: account.id } },
      )

      if (isStatusSuccessful(status)) {
        setDatabases(data)
      }
    } catch (error) {
      setDatabasesError(getApiErrorMessage(error as AxiosError))
    } finally {
      setDatabasesLoading(false)
    }
  }

  const addDatabases = async (): Promise<boolean> => {
    if (!account?.id || selectedDatabases.length === 0) {
      return false
    }

    setDatabasesLoading(true)
    setDatabasesError('')

    const results = await Promise.all(
      selectedDatabases.map(async (database) => {
        try {
          const { data, status } = await apiService.get<AzureConnectionDetails>(
            ApiEndpoints.AZURE_CONNECTION_DETAILS,
            { params: { accountId: account.id, databaseId: database.id } },
          )

          if (isStatusSuccessful(status) && data) {
            const providerDetails: AzureProviderDetails = {
              provider: CloudProvider.Azure,
              authType: data.authType,
              azureAccountId: data.azureAccountId,
            }

            const result = await instancesService.createInstance({
              host: data.host,
              port: data.port,
              name: database.name,
              username: data.username,
              password: data.password,
              tls: data.tls,
              provider: ConnectionProvider.AZURE,
              nameFromProvider: database.name,
              providerDetails,
            })

            if (result) {
              return { database, success: true }
            }
            return { database, success: false }
          }
          return { database, success: false }
        } catch (error) {
          return {
            database,
            success: false,
            message: getApiErrorMessage(error as AxiosError),
          }
        }
      }),
    )

    setDatabasesLoading(false)
    setAddedDatabases(results)

    return results.some((r) => r.success)
  }

  const value = useMemo<AzureAutodiscoveryContextType>(
    () => ({
      subscriptions,
      selectedSubscription,
      subscriptionsLoading,
      subscriptionsError,
      fetchSubscriptions,
      selectSubscription,
      databases,
      selectedDatabases,
      databasesLoading,
      databasesError,
      addedDatabases,
      fetchDatabases,
      setSelectedDatabases,
      addDatabases,
    }),
    [
      subscriptions,
      selectedSubscription,
      subscriptionsLoading,
      subscriptionsError,
      databases,
      selectedDatabases,
      databasesLoading,
      databasesError,
      addedDatabases,
    ],
  )

  return (
    <AzureAutodiscoveryContext.Provider value={value}>
      {children}
    </AzureAutodiscoveryContext.Provider>
  )
}

export const useAzureAutodiscovery = (): AzureAutodiscoveryContextType => {
  const context = useContext(AzureAutodiscoveryContext)

  if (!context) {
    throw new Error(
      'useAzureAutodiscovery must be used within an AzureAutodiscoveryProvider',
    )
  }

  return context
}
