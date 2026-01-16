import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { AppDispatch, RootState } from 'uiSrc/slices/store'
import { isStatusSuccessful } from 'uiSrc/utils'

export interface AzureUserInfo {
  oid: string
  upn: string
  name?: string
  homeAccountId?: string
}

export interface AzureSubscription {
  subscriptionId: string
  displayName: string
  state: string
}

export interface AzureDatabase {
  id: string
  name: string
  subscriptionId: string
  subscriptionName: string
  resourceGroup: string
  location: string
  type: 'standard' | 'enterprise'
  host: string
  port: number
  sslPort?: number
  provisioningState: string
  accessKeysAuthentication?: 'Enabled' | 'Disabled'
}

export interface AzureState {
  isLoggedIn: boolean
  loading: boolean
  user: AzureUserInfo | null
  subscriptions: AzureSubscription[]
  subscriptionsLoading: boolean
  selectedSubscription: AzureSubscription | null
  databases: AzureDatabase[]
  databasesLoading: boolean
  error: string | null
}

const initialState: AzureState = {
  isLoggedIn: false,
  loading: false,
  user: null,
  subscriptions: [],
  subscriptionsLoading: false,
  selectedSubscription: null,
  databases: [],
  databasesLoading: false,
  error: null,
}

const azureSlice = createSlice({
  name: 'azure',
  initialState,
  reducers: {
    setAzureLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload
    },
    setAzureLoggedIn: (
      state,
      { payload }: PayloadAction<{ isLoggedIn: boolean; user?: AzureUserInfo }>,
    ) => {
      state.isLoggedIn = payload.isLoggedIn
      state.user = payload.user || null
      state.loading = false
    },
    setAzureLoggedOut: (state) => {
      state.isLoggedIn = false
      state.user = null
      state.subscriptions = []
      state.selectedSubscription = null
      state.databases = []
    },
    setAzureSubscriptionsLoading: (
      state,
      { payload }: PayloadAction<boolean>,
    ) => {
      state.subscriptionsLoading = payload
    },
    setAzureSubscriptions: (
      state,
      { payload }: PayloadAction<AzureSubscription[]>,
    ) => {
      state.subscriptions = payload
      state.subscriptionsLoading = false
    },
    setAzureSelectedSubscription: (
      state,
      { payload }: PayloadAction<AzureSubscription | null>,
    ) => {
      state.selectedSubscription = payload
      state.databases = []
    },
    setAzureDatabasesLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.databasesLoading = payload
    },
    setAzureDatabases: (state, { payload }: PayloadAction<AzureDatabase[]>) => {
      state.databases = payload
      state.databasesLoading = false
    },
    setAzureError: (state, { payload }: PayloadAction<string | null>) => {
      state.error = payload
      state.loading = false
      state.subscriptionsLoading = false
      state.databasesLoading = false
    },
    resetAzureState: () => initialState,
  },
})

export const {
  setAzureLoading,
  setAzureLoggedIn,
  setAzureLoggedOut,
  setAzureSubscriptionsLoading,
  setAzureSubscriptions,
  setAzureSelectedSubscription,
  setAzureDatabasesLoading,
  setAzureDatabases,
  setAzureError,
  resetAzureState,
} = azureSlice.actions

// Selectors
export const azureSelector = (state: RootState) => state.azure

// Thunks
export const checkAzureAuthStatus = () => async (dispatch: AppDispatch) => {
  dispatch(setAzureLoading(true))
  try {
    const { data, status } = await apiService.get('/azure/auth/status')
    if (isStatusSuccessful(status)) {
      dispatch(
        setAzureLoggedIn({
          isLoggedIn: data.isLoggedIn,
          user: data.user,
        }),
      )
    }
  } catch (error) {
    dispatch(setAzureLoggedIn({ isLoggedIn: false }))
  }
}

export const logoutAzure = () => async (dispatch: AppDispatch) => {
  dispatch(setAzureLoading(true))
  try {
    await apiService.post('/azure/auth/logout')
    dispatch(setAzureLoggedOut())
  } catch (error) {
    dispatch(addErrorNotification(error as AxiosError))
    dispatch(setAzureLoading(false))
  }
}

export const fetchAzureSubscriptions = () => async (dispatch: AppDispatch) => {
  dispatch(setAzureSubscriptionsLoading(true))
  try {
    const { data, status } = await apiService.get('/azure/subscriptions')
    if (isStatusSuccessful(status)) {
      dispatch(setAzureSubscriptions(data))
    }
  } catch (error) {
    dispatch(addErrorNotification(error as AxiosError))
    dispatch(setAzureSubscriptionsLoading(false))
  }
}

export const fetchAzureDatabasesInSubscription =
  (subscription: AzureSubscription) => async (dispatch: AppDispatch) => {
    dispatch(setAzureDatabasesLoading(true))
    try {
      const { data, status } = await apiService.post(
        '/azure/subscriptions/databases',
        subscription,
      )
      if (isStatusSuccessful(status)) {
        dispatch(setAzureDatabases(data))
      }
    } catch (error) {
      dispatch(addErrorNotification(error as AxiosError))
      dispatch(setAzureDatabasesLoading(false))
    }
  }

export const fetchAzureDatabases = () => async (dispatch: AppDispatch) => {
  dispatch(setAzureDatabasesLoading(true))
  try {
    const { data, status } = await apiService.get('/azure/databases')
    if (isStatusSuccessful(status)) {
      dispatch(setAzureDatabases(data))
    }
  } catch (error) {
    dispatch(addErrorNotification(error as AxiosError))
    dispatch(setAzureDatabasesLoading(false))
  }
}

/**
 * Ensure Azure token is valid for a database before connecting.
 * This should be called before connecting to an Azure Entra ID database.
 * Returns true if the token is valid/refreshed, false if not an Azure DB or refresh failed.
 */
export const ensureAzureDatabaseToken = async (
  databaseId: string,
): Promise<boolean> => {
  try {
    const { status } = await apiService.get(
      `/azure/auth/ensure-database-token/${databaseId}`,
    )
    return isStatusSuccessful(status)
  } catch {
    // Token refresh failed - this is expected for non-Azure databases
    // or when re-authentication is needed
    return false
  }
}

export default azureSlice.reducer
