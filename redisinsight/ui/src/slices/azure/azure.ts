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
  databases: AzureDatabase[]
  databasesLoading: boolean
  error: string | null
}

const initialState: AzureState = {
  isLoggedIn: false,
  loading: false,
  user: null,
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
      state.databases = []
    },
    setAzureDatabasesLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.databasesLoading = payload
    },
    setAzureDatabases: (
      state,
      { payload }: PayloadAction<AzureDatabase[]>,
    ) => {
      state.databases = payload
      state.databasesLoading = false
    },
    setAzureError: (state, { payload }: PayloadAction<string | null>) => {
      state.error = payload
      state.loading = false
      state.databasesLoading = false
    },
    resetAzureState: () => initialState,
  },
})

export const {
  setAzureLoading,
  setAzureLoggedIn,
  setAzureLoggedOut,
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

export default azureSlice.reducer

