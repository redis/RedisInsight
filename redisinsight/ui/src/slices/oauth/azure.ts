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
import { AzureLoginSource } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

const OAUTH_TIMEOUT_MS = 60 * 1000
let oauthTimeoutId: ReturnType<typeof setTimeout> | null = null

export interface AzureAccount {
  id: string
  username: string
  name?: string
  /** Realm (tenant) GUID the token was issued for. */
  tenantId?: string
}

export interface AzureAuthLoginResponse {
  url: string
}

export interface StateAzureAuth {
  loading: boolean
  account: AzureAccount | null
  error: string
  source: AzureLoginSource | null
  /**
   * Realm (tenant) GUID of the signed-in account; autodiscovery fetches
   * target it. Null until a sign-in succeeds.
   */
  tenant: string | null
}

export enum AzureOAuthPrompt {
  /**
   * Force the account picker to appear, allowing the user to select a different account.
   */
  SelectAccount = 'select_account',

  /**
   * Force re-authentication, even if the user has a valid session.
   */
  Login = 'login',

  /**
   * Force the consent dialog to appear, even if consent was previously granted.
   */
  Consent = 'consent',
}

export enum AzureOAuthRedirectType {
  /**
   * Uses custom protocol (redisinsight://) for Electron app deep linking.
   */
  Deeplink = 'deeplink',

  /**
   * Uses HTTP localhost callback for web/Docker deployments with localStorage polling.
   */
  Web = 'web',
}

export const initialState: StateAzureAuth = {
  loading: false,
  account: null,
  error: '',
  source: null,
  tenant: null,
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
    setAzureLoginSource: (
      state,
      { payload }: PayloadAction<AzureLoginSource | null>,
    ) => {
      state.source = payload
    },
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
      state.source = null
    },
    azureOAuthCallbackSuccess: (
      state,
      { payload }: PayloadAction<AzureAccount>,
    ) => {
      state.loading = false
      state.account = payload
      // Set only on success so a failed sign-in can't leave a tenant the
      // user never signed into.
      state.tenant = payload.tenantId ?? null
      state.error = ''
    },
    azureOAuthCallbackFailure: (state, { payload }: PayloadAction<string>) => {
      state.loading = false
      state.error = payload
      state.source = null
    },
    azureAuthLogout: (state) => {
      state.account = null
      state.error = ''
      state.source = null
      state.tenant = null
    },
  },
})

export const {
  setAzureAuthInitialState,
  setAzureLoginSource,
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
export const azureAuthSourceSelector = (state: RootState) =>
  state.oauth.azure?.source
export const azureAuthTenantSelector = (state: RootState) =>
  state.oauth.azure?.tenant

// The reducer
export default azureAuthSlice.reducer

export interface InitiateAzureLoginOptions {
  source: AzureLoginSource
  prompt?: AzureOAuthPrompt
  redirectType?: AzureOAuthRedirectType
  tenantId?: string
  onSuccess?: (url: string) => void
  onFail?: () => void
}

// Thunk action to initiate Azure login
export function initiateAzureLoginAction(options: InitiateAzureLoginOptions) {
  const { source, prompt, redirectType, tenantId, onSuccess, onFail } = options

  return async (dispatch: AppDispatch) => {
    dispatch(setAzureLoginSource(source))
    sendEventTelemetry({
      event: TelemetryEvent.AZURE_SIGN_IN_CLICKED,
      eventData: {
        // Whether the user signed in against a specific tenant (multi-tenant
        // selector) vs. the default home tenant. Not the tenant value itself.
        customTenant: Boolean(tenantId),
      },
    })
    dispatch(azureAuthLogin())

    try {
      const params: Record<string, string> = {}
      if (prompt) params.prompt = prompt
      if (redirectType) params.redirectType = redirectType
      if (tenantId) params.tenantId = tenantId

      const { data, status } = await apiService.get<AzureAuthLoginResponse>(
        ApiEndpoints.AZURE_AUTH_LOGIN,
        { params: Object.keys(params).length > 0 ? params : undefined },
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

export function cancelAzureLoginAction() {
  return (dispatch: AppDispatch) => {
    clearOAuthTimeout()
    dispatch(setAzureAuthInitialState())
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
