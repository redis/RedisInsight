import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { AppDispatch, RootState } from 'uiSrc/slices/store'
import {
  addErrorNotification,
  IAddInstanceErrorPayload,
} from 'uiSrc/slices/app/notifications'
import { resetDataAzure } from 'uiSrc/slices/instances/azure'

const OAUTH_TIMEOUT_MS = 60 * 1000
let oauthTimeoutId: ReturnType<typeof setTimeout> | null = null

export interface AzureAccount {
  id: string
  username: string
  name?: string
}

export interface AzureAuthLoginResponse {
  url: string
}

export interface StateAzureAuth {
  loading: boolean
  account: AzureAccount | null
  error: string
}

export const initialState: StateAzureAuth = {
  loading: false,
  account: null,
  error: '',
}

const clearOAuthTimeout = () => {
  if (oauthTimeoutId) {
    clearTimeout(oauthTimeoutId)
    oauthTimeoutId = null
  }
}

const azureAuthSlice = createSlice({
  name: 'azureAuth',
  initialState,
  reducers: {
    setAzureAuthInitialState: () => initialState,
    azureAuthLogin: (state) => {
      state.loading = true
      state.error = ''
    },
    azureAuthLoginSuccess: (state) => {
      // Keep loading true - waiting for the OAuth callback
      // Loading will be set to false by azureOAuthCallbackSuccess or azureOAuthCallbackFailure
      state.error = ''
    },
    azureAuthLoginFailure: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = payload
    },
    azureOAuthCallbackSuccess: (
      state,
      { payload }: PayloadAction<AzureAccount>,
    ) => {
      state.loading = false
      state.account = payload
      state.error = ''
    },
    azureOAuthCallbackFailure: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = payload
    },
    azureAuthLogout: (state) => {
      state.account = null
      state.error = ''
    },
  },
})

export const {
  setAzureAuthInitialState,
  azureAuthLogin,
  azureAuthLoginSuccess,
  azureAuthLoginFailure,
  azureOAuthCallbackSuccess,
  azureOAuthCallbackFailure,
  azureAuthLogout,
} = azureAuthSlice.actions

// Selectors
export const azureAuthSelector = (state: RootState) => state.oauth.azure
export const azureAuthAccountSelector = (state: RootState) =>
  state.oauth.azure?.account
export const azureAuthLoadingSelector = (state: RootState) =>
  state.oauth.azure?.loading

// The reducer
export default azureAuthSlice.reducer

// Thunk action to initiate Azure login
export function initiateAzureLoginAction(
  onSuccess?: (url: string) => void,
  onFail?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(azureAuthLogin())

    try {
      const { data, status } = await apiService.get<AzureAuthLoginResponse>(
        ApiEndpoints.AZURE_AUTH_LOGIN,
      )

      if (isStatusSuccessful(status)) {
        dispatch(azureAuthLoginSuccess())
        onSuccess?.(data.url)

        // Start timeout to reset loading state if OAuth flow is abandoned
        clearOAuthTimeout()
        oauthTimeoutId = setTimeout(() => {
          dispatch(setAzureAuthInitialState())
        }, OAUTH_TIMEOUT_MS)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error as AxiosError)
      dispatch(azureAuthLoginFailure(errorMessage))
      dispatch(addErrorNotification(error as IAddInstanceErrorPayload))
      onFail?.()
    }
  }
}

export function handleAzureOAuthSuccess(account: AzureAccount) {
  return (dispatch: AppDispatch) => {
    clearOAuthTimeout()
    // Clear stale subscriptions/databases data from previous account
    dispatch(resetDataAzure())
    dispatch(azureOAuthCallbackSuccess(account))
  }
}

export function handleAzureOAuthFailure(errorMessage: string) {
  return (dispatch: AppDispatch) => {
    clearOAuthTimeout()
    dispatch(azureOAuthCallbackFailure(errorMessage))
  }
}
