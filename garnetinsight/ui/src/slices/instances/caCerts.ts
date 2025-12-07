import { createSlice } from '@reduxjs/toolkit'

import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { getApiErrorMessage, isStatusSuccessful } from 'uiSrc/utils'
import { addErrorNotification } from '../app/notifications'
import { AppDispatch, RootState } from '../store'

export const initialState = {
  loading: false,
  error: '',
  data: [],
}

// A slice for recipes
const caCertsSlice = createSlice({
  name: 'caCerts',
  initialState,
  reducers: {
    // load ca certificates
    loadCaCerts: (state) => {
      state.loading = true
      state.error = ''
    },
    loadCaCertsSuccess: (state, { payload }) => {
      state.data = payload
      state.loading = false
    },
    loadCaCertsFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // delete ca certificate
    deleteCaCertificate: (state) => {
      state.loading = true
      state.error = ''
    },
    deleteCaCertificateSuccess: (state) => {
      state.loading = false
    },
    deleteCaCertificateFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
  },
})

// Actions generated from the slice
export const {
  loadCaCerts,
  loadCaCertsSuccess,
  loadCaCertsFailure,

  deleteCaCertificate,
  deleteCaCertificateSuccess,
  deleteCaCertificateFailure,
} = caCertsSlice.actions

// A selector
export const caCertsSelector = (state: RootState) => state.connections.caCerts

// The reducer
export default caCertsSlice.reducer

// Asynchronous thunk action
export function fetchCaCerts() {
  return async (dispatch: AppDispatch) => {
    dispatch(loadCaCerts())

    try {
      const { data, status } = await apiService.get(
        `${ApiEndpoints.CA_CERTIFICATES}`,
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadCaCertsSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadCaCertsFailure(errorMessage))
    }
  }
}

export function deleteCaCertificateAction(
  id: string,
  onSuccessAction?: (id: string) => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(deleteCaCertificate(id))

    try {
      const { status } = await apiService.delete(
        `${ApiEndpoints.CA_CERTIFICATES}/${id}`,
      )

      if (isStatusSuccessful(status)) {
        dispatch(deleteCaCertificateSuccess())
        onSuccessAction?.(id)
        dispatch(fetchCaCerts())
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(deleteCaCertificateFailure(errorMessage))
    }
  }
}
