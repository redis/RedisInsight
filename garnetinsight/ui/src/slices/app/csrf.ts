import { createSlice } from '@reduxjs/toolkit'
import apiService, { setApiCsrfHeader } from 'uiSrc/services/apiService'
import { setResourceCsrfHeader } from 'uiSrc/services/resourcesService'
import { getConfig } from 'uiSrc/config'
import { AppDispatch, RootState } from '../store'

const riConfig = getConfig()
export const getCsrfEndpoint = () => riConfig.api.csrfEndpoint

export interface CSRFTokenResponse {
  token: string
}

export const initialState: {
  csrfEndpoint: string
  loading: boolean
  token: string
  error: string
} = {
  csrfEndpoint: getCsrfEndpoint(),
  loading: false,
  token: '',
  error: '',
}

const appCsrfSlice = createSlice({
  name: 'appCsrf',
  initialState,
  reducers: {
    fetchCsrfToken: (state) => {
      state.loading = true
    },
    fetchCsrfTokenSuccess: (
      state,
      { payload }: { payload: { token: string } },
    ) => {
      state.token = payload.token
      state.loading = false
    },
    fetchCsrfTokenFail: (
      state,
      { payload }: { payload: { error: string } },
    ) => {
      state.loading = false
      state.token = ''
      state.error = payload.error
    },
  },
})

export const { fetchCsrfToken, fetchCsrfTokenSuccess, fetchCsrfTokenFail } =
  appCsrfSlice.actions

export const appCsrfSelector = (state: RootState) => state.app.csrf

export default appCsrfSlice.reducer

export function fetchCsrfTokenAction(
  onSuccessAction?: (data: any) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      if (getCsrfEndpoint()) {
        dispatch(fetchCsrfToken())

        const { data } =
          await apiService.get<CSRFTokenResponse>(getCsrfEndpoint())

        setApiCsrfHeader(data.token)
        setResourceCsrfHeader(data.token)
        dispatch(fetchCsrfTokenSuccess({ token: data.token }))
        onSuccessAction?.(data)
      }
    } catch (error: any) {
      console.error('Error fetching CSRF token: ', error)
      dispatch(fetchCsrfTokenFail({ error: error?.message || '' }))
      onFailAction?.()
    }
  }
}
