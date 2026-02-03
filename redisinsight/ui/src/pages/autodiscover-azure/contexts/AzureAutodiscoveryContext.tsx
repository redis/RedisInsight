import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useSelector } from 'react-redux'
import { AxiosError } from 'axios'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints } from 'uiSrc/constants'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { azureAuthAccountSelector } from 'uiSrc/slices/oauth/azure'
import {
  AzureSubscription,
  AzureRedisDatabase,
  AzureConnectionDetails,
} from 'uiSrc/slices/interfaces'

export interface AzureAutodiscoveryState {
  loading: boolean
  error: string
  subscriptions: AzureSubscription[]
  selectedSubscription: AzureSubscription | null
  databases: AzureRedisDatabase[]
  selectedDatabases: AzureRedisDatabase[]
  addedDatabases: {
    database: AzureRedisDatabase
    success: boolean
    message?: string
  }[]
}

export interface AzureAutodiscoveryContextType extends AzureAutodiscoveryState {
  fetchSubscriptions: () => Promise<void>
  selectSubscription: (subscription: AzureSubscription) => void
  fetchDatabases: (subscriptionId: string) => Promise<void>
  setSelectedDatabases: (databases: AzureRedisDatabase[]) => void
  addDatabases: () => Promise<boolean>
  reset: () => void
}

const initialState: AzureAutodiscoveryState = {
  loading: true,
  error: '',
  subscriptions: [],
  selectedSubscription: null,
  databases: [],
  selectedDatabases: [],
  addedDatabases: [],
}

const AzureAutodiscoveryContext = createContext<
  AzureAutodiscoveryContextType | undefined
>(undefined)

export const AzureAutodiscoveryProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const account = useSelector(azureAuthAccountSelector)
  const [state, setState] = useState<AzureAutodiscoveryState>(initialState)

  const fetchSubscriptions = useCallback(async () => {
    if (!account?.id) {
      setState((prev) => ({ ...prev, error: 'No Azure account found' }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: '' }))

    try {
      const { data, status } = await apiService.get<AzureSubscription[]>(
        ApiEndpoints.AZURE_SUBSCRIPTIONS,
        { params: { accountId: account.id } },
      )

      if (isStatusSuccessful(status)) {
        setState((prev) => ({
          ...prev,
          loading: false,
          subscriptions: data,
        }))
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: getApiErrorMessage(error as AxiosError),
      }))
    }
  }, [account?.id])

  const selectSubscription = useCallback((subscription: AzureSubscription) => {
    setState((prev) => ({
      ...prev,
      selectedSubscription: subscription,
      databases: [],
      selectedDatabases: [],
    }))
  }, [])

  const fetchDatabases = useCallback(
    async (subscriptionId: string) => {
      if (!account?.id) {
        setState((prev) => ({ ...prev, error: 'No Azure account found' }))
        return
      }

      setState((prev) => ({ ...prev, loading: true, error: '' }))

      try {
        const { data, status } = await apiService.get<AzureRedisDatabase[]>(
          `${ApiEndpoints.AZURE_DATABASES}/${subscriptionId}/databases`,
          { params: { accountId: account.id } },
        )

        if (isStatusSuccessful(status)) {
          setState((prev) => ({
            ...prev,
            loading: false,
            databases: data,
          }))
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: getApiErrorMessage(error as AxiosError),
        }))
      }
    },
    [account?.id],
  )

  const setSelectedDatabases = useCallback(
    (databases: AzureRedisDatabase[]) => {
      setState((prev) => ({ ...prev, selectedDatabases: databases }))
    },
    [],
  )

  const addDatabases = useCallback(async (): Promise<boolean> => {
    if (!account?.id || state.selectedDatabases.length === 0) {
      return false
    }

    setState((prev) => ({ ...prev, loading: true, error: '' }))
    const results: AzureAutodiscoveryState['addedDatabases'] = []

    for (const database of state.selectedDatabases) {
      try {
        const { data, status } = await apiService.get<AzureConnectionDetails>(
          ApiEndpoints.AZURE_CONNECTION_DETAILS,
          {
            params: {
              accountId: account.id,
              databaseId: database.id,
            },
          },
        )

        if (isStatusSuccessful(status) && data) {
          // TODO: add database using connection details
          console.log(JSON.stringify(data))
          results.push({ database, success: true })
        }
      } catch (error) {
        results.push({
          database,
          success: false,
          message: getApiErrorMessage(error as AxiosError),
        })
      }
    }

    setState((prev) => ({
      ...prev,
      loading: false,
      addedDatabases: results,
    }))

    return results.some((r) => r.success)
  }, [account?.id, state.selectedDatabases])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const value = useMemo<AzureAutodiscoveryContextType>(
    () => ({
      ...state,
      fetchSubscriptions,
      selectSubscription,
      fetchDatabases,
      setSelectedDatabases,
      addDatabases,
      reset,
    }),
    [
      state,
      fetchSubscriptions,
      selectSubscription,
      fetchDatabases,
      setSelectedDatabases,
      addDatabases,
      reset,
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
