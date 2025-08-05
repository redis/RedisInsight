import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { findIndex, isUndefined } from 'lodash'
import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import {
  getApiErrorMessage,
  getApiErrorName,
  isStatusSuccessful,
  Maybe,
  Nullable,
} from 'uiSrc/utils'
import { NotificationsDto } from 'apiSrc/modules/notification/dto'
import {
  IError,
  IGlobalNotification,
  InfiniteMessage,
  StateAppNotifications,
} from '../interfaces'

import { AppDispatch, RootState } from '../store'

export const initialState: StateAppNotifications = {
  errors: [],
  messages: [],
  infiniteMessages: [],
  notificationCenter: {
    loading: false,
    lastReceivedNotification: null,
    notifications: [],
    isNotificationOpen: false,
    isCenterOpen: false,
    totalUnread: 0,
    shouldDisplayToast: false,
  },
}

export interface IAddInstanceErrorPayload extends AxiosError {
  instanceId?: string
  response?: AxiosError['response'] & {
    data: {
      title?: string
      additionalInfo?: Record<string, any>
    }
  }
}
// A slice for recipes
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addErrorNotification: (
      state,
      { payload }: { payload: IAddInstanceErrorPayload },
    ) => {
      const { instanceId } = payload
      const title = payload?.response?.data?.title
      const errorName = getApiErrorName(payload)
      const message = getApiErrorMessage(payload)
      const additionalInfo = payload?.response?.data?.additionalInfo
      const errorExistedId = state.errors.findIndex(
        (err) => err.message === message,
      )

      if (errorExistedId !== -1) {
        notificationsSlice.caseReducers.removeError(state, {
          payload: current(state.errors[errorExistedId])?.id ?? '',
        })
      }

      const error: IError = {
        ...payload,
        title,
        instanceId,
        id: `${Date.now()}`,
        name: errorName,
        message,
      }

      if (additionalInfo) {
        error.additionalInfo = additionalInfo
      }

      state.errors.push(error)
    },
    removeError: (state, { payload = '' }: { payload: string }) => {
      if (state.errors.find((error) => error.id === payload)) {
        state.errors = state.errors.filter((error) => error.id !== payload)
      }
    },
    resetErrors: (state) => {
      state.errors = []
    },
    addMessageNotification: (state, { payload }) => {
      state.messages.push({
        ...payload,
        id: `${Date.now()}`,
        group: payload.group,
      })
    },
    removeMessage: (state, { payload = '' }: { payload: string }) => {
      if (state.messages.find((message) => message.id === payload)) {
        state.messages = state.messages.filter(
          (message) => message.id !== payload,
        )
      }
      if (state.errors.find((error) => error.id === payload)) {
        state.errors = state.errors.filter((error) => error.id !== payload)
      }
    },
    resetMessages: (state) => {
      state.messages = []
    },
    setIsCenterOpen: (state, { payload }: { payload: Maybe<boolean> }) => {
      if (isUndefined(payload)) {
        state.notificationCenter.isCenterOpen =
          !state.notificationCenter.isCenterOpen
        return
      }
      state.notificationCenter.isCenterOpen = payload
    },
    setIsNotificationOpen: (
      state,
      { payload }: { payload: Maybe<boolean> },
    ) => {
      if (isUndefined(payload)) {
        state.notificationCenter.isNotificationOpen =
          !state.notificationCenter.isNotificationOpen
        return
      }
      state.notificationCenter.isNotificationOpen = payload
    },
    setNewNotificationReceived: (
      state,
      { payload }: { payload: NotificationsDto },
    ) => {
      state.notificationCenter.totalUnread = payload.totalUnread
      state.notificationCenter.isNotificationOpen = true
    },
    setLastReceivedNotification: (
      state,
      { payload }: { payload: Nullable<IGlobalNotification> },
    ) => {
      state.notificationCenter.lastReceivedNotification = payload
    },
    getNotifications: (state) => {
      state.notificationCenter.loading = true
    },
    getNotificationsSuccess: (
      state,
      { payload }: { payload: NotificationsDto },
    ) => {
      state.notificationCenter.loading = false
      state.notificationCenter.notifications = payload.notifications
      state.notificationCenter.totalUnread = payload.totalUnread
    },
    getNotificationsFailed: (state) => {
      state.notificationCenter.loading = false
    },
    unreadNotifications: (state, { payload }) => {
      state.notificationCenter.totalUnread = payload
    },
    addInfiniteNotification: (
      state,
      { payload }: PayloadAction<InfiniteMessage>,
    ) => {
      const index = findIndex(state.infiniteMessages, { id: payload.id })
      if (index === -1) {
        state.infiniteMessages.push(payload)
      } else {
        state.infiniteMessages[index] = payload
      }
    },
    removeInfiniteNotification: (state, { payload }: PayloadAction<string>) => {
      if (state.infiniteMessages.find((message) => message.id === payload)) {
        state.infiniteMessages = state.infiniteMessages.filter(
          (message) => message.id !== payload,
        )
      }
    },
  },
})

// Actions generated from the slice
export const {
  addErrorNotification,
  removeError,
  resetErrors,
  addMessageNotification,
  removeMessage,
  resetMessages,
  setIsCenterOpen,
  setIsNotificationOpen,
  setNewNotificationReceived,
  setLastReceivedNotification,
  getNotifications,
  getNotificationsSuccess,
  getNotificationsFailed,
  unreadNotifications,
  addInfiniteNotification,
  removeInfiniteNotification,
} = notificationsSlice.actions

// Selectors
export const errorsSelector = (state: RootState) =>
  state.app.notifications.errors
export const messagesSelector = (state: RootState) =>
  state.app.notifications.messages
export const infiniteNotificationsSelector = (state: RootState) =>
  state.app.notifications.infiniteMessages
export const notificationCenterSelector = (state: RootState) =>
  state.app.notifications.notificationCenter

// The reducer
export default notificationsSlice.reducer

export function fetchNotificationsAction(
  onSuccessAction?: (totalCount: number, numberOfNotifications: number) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getNotifications())

    try {
      const { data, status } = await apiService.get<NotificationsDto>(
        ApiEndpoints.NOTIFICATIONS,
      )

      if (isStatusSuccessful(status)) {
        dispatch(getNotificationsSuccess(data))
        onSuccessAction?.(data.totalUnread, data.notifications?.length)
      }
    } catch (error) {
      dispatch(getNotificationsFailed())
      onFailAction?.()
    }
  }
}

export function unreadNotificationsAction(notification?: {
  timestamp: number
  type: string
}) {
  return async (dispatch: AppDispatch) => {
    try {
      const { data, status } = await apiService.patch(
        ApiEndpoints.NOTIFICATIONS_READ,
        notification,
      )

      if (isStatusSuccessful(status)) {
        dispatch(unreadNotifications(data.totalUnread))
      }
    } catch (error) {
      //
    }
  }
}

export function setNewNotificationAction(data: NotificationsDto) {
  return (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    dispatch(setNewNotificationReceived(data))
    const toastNotification = state.user.settings.config?.agreements
      ?.notifications
      ? data.notifications[0]
      : null
    dispatch(setLastReceivedNotification(toastNotification))
  }
}
