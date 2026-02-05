import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { cloneDeep } from 'lodash'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import {
  getApiErrorMessage,
  getAxiosError,
  isStatusSuccessful,
} from 'uiSrc/utils'
import {
  AzureRedisDatabase,
  AzureRedisType,
  AzureSubscription,
  EnhancedAxiosError,
  ImportAzureDatabaseResponse,
  InitialStateAzure,
  LoadedAzure,
} from '../interfaces'
import {
  addErrorNotification,
  IAddInstanceErrorPayload,
} from '../app/notifications'
import { AppDispatch, RootState } from '../store'

export const initialState: InitialStateAzure = {
  loading: false,
  error: '',
  subscriptions: null,
  selectedSubscription: null,
  databases: null,
  databasesAdded: [],
  loaded: {
    [LoadedAzure.Subscriptions]: false,
    [LoadedAzure.Databases]: false,
    [LoadedAzure.DatabasesAdded]: false,
  },
}

const azureSlice = createSlice({
  name: 'azure',
  initialState,
  reducers: {
    // Load subscriptions
    loadSubscriptionsAzure: (state) => {
      state.loading = true
      state.error = ''
    },
    loadSubscriptionsAzureSuccess: (
      state,
      { payload }: PayloadAction<AzureSubscription[]>,
    ) => {
      state.loading = false
      state.loaded[LoadedAzure.Subscriptions] = true
      state.subscriptions = payload
    },
    loadSubscriptionsAzureFailure: (
      state,
      { payload }: PayloadAction<string>,
    ) => {
      state.loading = false
      state.error = payload
    },

    // Select subscription
    setSelectedSubscriptionAzure: (
      state,
      { payload }: PayloadAction<AzureSubscription | null>,
    ) => {
      // Only reset databases if subscription actually changed
      const subscriptionChanged =
        state.selectedSubscription?.subscriptionId !== payload?.subscriptionId

      state.selectedSubscription = payload

      if (subscriptionChanged) {
        state.databases = null
        state.databasesAdded = []
        state.loaded[LoadedAzure.Databases] = false
        state.loaded[LoadedAzure.DatabasesAdded] = false
      }
    },

    // Load databases
    loadDatabasesAzure: (state) => {
      state.loading = true
      state.error = ''
    },
    loadDatabasesAzureSuccess: (
      state,
      { payload }: PayloadAction<AzureRedisDatabase[]>,
    ) => {
      state.loading = false
      state.loaded[LoadedAzure.Databases] = true
      state.databases = payload
    },
    loadDatabasesAzureFailure: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = payload
    },

    // Add databases
    addDatabasesAzure: (state) => {
      state.loading = true
      state.error = ''
    },
    addDatabasesAzureSuccess: (
      state,
      { payload }: PayloadAction<ImportAzureDatabaseResponse[]>,
    ) => {
      state.loading = false
      state.loaded[LoadedAzure.DatabasesAdded] = true

      // Map responses to databases with status
      // Use databaseDetails from response, fallback to local state lookup
      state.databasesAdded = payload.map((response) => {
        const database =
          response.databaseDetails ??
          state.databases?.find((db) => db.id === response.id)

        if (!database) {
          // Should not happen, but handle gracefully
          return {
            id: response.id,
            name: response.id,
            subscriptionId: '',
            resourceGroup: '',
            location: '',
            type: AzureRedisType.Standard,
            host: '',
            port: 0,
            provisioningState: '',
            statusAdded: response.status,
            messageAdded: response.message,
          }
        }

        return {
          ...database,
          statusAdded: response.status,
          messageAdded: response.message,
        }
      })
    },
    addDatabasesAzureFailure: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = payload
    },

    // Reset
    resetDataAzure: () => cloneDeep(initialState),
    resetLoadedAzure: (state, { payload }: PayloadAction<LoadedAzure>) => {
      state.loaded[payload] = false
    },

    clearSubscriptionsAzure: (state) => {
      state.subscriptions = null
      state.databases = null
      state.databasesAdded = []
      state.loaded[LoadedAzure.Subscriptions] = false
      state.loaded[LoadedAzure.Databases] = false
      state.loaded[LoadedAzure.DatabasesAdded] = false
    },
    clearDatabasesAzure: (state) => {
      state.databases = null
      state.databasesAdded = []
      state.loaded[LoadedAzure.Databases] = false
      state.loaded[LoadedAzure.DatabasesAdded] = false
    },
  },
})

export const {
  loadSubscriptionsAzure,
  loadSubscriptionsAzureSuccess,
  loadSubscriptionsAzureFailure,
  setSelectedSubscriptionAzure,
  loadDatabasesAzure,
  loadDatabasesAzureSuccess,
  loadDatabasesAzureFailure,
  addDatabasesAzure,
  addDatabasesAzureSuccess,
  addDatabasesAzureFailure,
  resetDataAzure,
  resetLoadedAzure,
  clearSubscriptionsAzure,
  clearDatabasesAzure,
} = azureSlice.actions

// Selectors
export const azureSelector = (state: RootState) => state.connections.azure

export default azureSlice.reducer

// Thunk actions
export function fetchSubscriptionsAzure(accountId: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadSubscriptionsAzure())

    try {
      const { data, status } = await apiService.get<AzureSubscription[]>(
        ApiEndpoints.AZURE_SUBSCRIPTIONS,
        { params: { accountId } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadSubscriptionsAzureSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as EnhancedAxiosError)
      const err = getAxiosError(error as EnhancedAxiosError)

      dispatch(loadSubscriptionsAzureFailure(errorMessage))
      dispatch(addErrorNotification(err as IAddInstanceErrorPayload))
    }
  }
}

export function fetchDatabasesAzure(accountId: string, subscriptionId: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(loadDatabasesAzure())

    try {
      const { data, status } = await apiService.get<AzureRedisDatabase[]>(
        `${ApiEndpoints.AZURE_SUBSCRIPTIONS}/${subscriptionId}/databases`,
        { params: { accountId } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadDatabasesAzureSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as EnhancedAxiosError)
      const err = getAxiosError(error as EnhancedAxiosError)

      dispatch(loadDatabasesAzureFailure(errorMessage))
      dispatch(addErrorNotification(err as IAddInstanceErrorPayload))
    }
  }
}

export function addDatabasesAzureAction(
  accountId: string,
  databaseIds: string[],
) {
  return async (dispatch: AppDispatch) => {
    dispatch(addDatabasesAzure())

    try {
      const { data, status } = await apiService.post<
        ImportAzureDatabaseResponse[]
      >(ApiEndpoints.AZURE_AUTODISCOVERY_DATABASES, {
        accountId,
        databases: databaseIds.map((id) => ({ id })),
      })

      if (isStatusSuccessful(status)) {
        dispatch(addDatabasesAzureSuccess(data))
        return data
      }
      return []
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as EnhancedAxiosError)
      const err = getAxiosError(error as EnhancedAxiosError)

      dispatch(addDatabasesAzureFailure(errorMessage))
      dispatch(addErrorNotification(err as IAddInstanceErrorPayload))
      return []
    }
  }
}
