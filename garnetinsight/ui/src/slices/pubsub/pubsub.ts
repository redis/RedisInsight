import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AxiosError } from 'axios'
import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { StatePubSub } from 'uiSrc/slices/interfaces/pubsub'
import { AppDispatch, RootState } from 'uiSrc/slices/store'
import { getApiErrorMessage, getUrl, isStatusSuccessful } from 'uiSrc/utils'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import { SubscriptionType } from 'uiSrc/constants/pubSub'
import { MessagesResponse } from 'apiSrc/modules/pub-sub/dto/messages.response'
import { PublishResponse } from 'apiSrc/modules/pub-sub/dto/publish.response'

export const initialState: StatePubSub = {
  loading: false,
  publishing: false,
  error: '',
  subscriptions: [],
  isSubscribeTriggered: false,
  isConnected: false,
  isSubscribed: false,
  messages: [],
  count: 0,
}

export const PUB_SUB_ITEMS_MAX_COUNT = 5_000

const pubSubSlice = createSlice({
  name: 'pubsub',
  initialState,
  reducers: {
    setInitialPubSubState: () => initialState,
    setPubSubConnected: (state, { payload }: PayloadAction<boolean>) => {
      state.isConnected = payload
    },
    toggleSubscribeTriggerPubSub: (
      state,
      { payload }: PayloadAction<string>,
    ) => {
      const channels = payload.trim() || DEFAULT_SEARCH_MATCH
      const subs = channels.split(' ').map((channel) => ({
        channel,
        type: SubscriptionType.PSubscribe,
      }))

      state.isSubscribeTriggered = !state.isSubscribeTriggered
      state.subscriptions = subs
    },
    setIsPubSubSubscribed: (state) => {
      state.isSubscribed = true
    },
    setIsPubSubUnSubscribed: (state) => {
      state.isSubscribed = false
    },
    concatPubSubMessages: (
      state,
      { payload }: PayloadAction<MessagesResponse>,
    ) => {
      state.count += payload.count
      if (payload.messages.length >= PUB_SUB_ITEMS_MAX_COUNT) {
        state.messages = [...payload.messages.slice(-PUB_SUB_ITEMS_MAX_COUNT)]
        return
      }

      let newItems = [...state.messages, ...payload.messages]

      if (newItems.length > PUB_SUB_ITEMS_MAX_COUNT) {
        newItems = newItems.slice(newItems.length - PUB_SUB_ITEMS_MAX_COUNT)
      }

      state.messages = newItems
    },
    clearPubSubMessages: (state) => {
      state.messages = []
      state.count = 0
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload
    },
    disconnectPubSub: (state) => {
      state.loading = false
      state.isSubscribed = false
      state.isSubscribeTriggered = false
      state.isConnected = false
    },
    publishMessage: (state) => {
      state.publishing = true
    },
    publishMessageSuccess: (state) => {
      state.publishing = false
      state.error = ''
    },
    publishMessageError: (state, { payload }) => {
      state.publishing = false
      state.error = payload
    },
  },
})

export const {
  setInitialPubSubState,
  setPubSubConnected,
  toggleSubscribeTriggerPubSub,
  setIsPubSubSubscribed,
  setIsPubSubUnSubscribed,
  concatPubSubMessages,
  clearPubSubMessages,
  setLoading,
  disconnectPubSub,
  publishMessage,
  publishMessageSuccess,
  publishMessageError,
} = pubSubSlice.actions

export const pubSubSelector = (state: RootState) => state.pubsub

export default pubSubSlice.reducer

// Asynchronous thunk action
export function publishMessageAction(
  instanceId: string,
  channel: string,
  message: string,
  onSuccessAction?: (affected: number) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(publishMessage())
      const { data, status } = await apiService.post<PublishResponse>(
        getUrl(instanceId, ApiEndpoints.PUB_SUB_MESSAGES),
        {
          channel,
          message,
        },
      )

      if (isStatusSuccessful(status)) {
        dispatch(publishMessageSuccess())
        onSuccessAction?.(data.affected)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(publishMessageError(errorMessage))
      onFailAction?.()
    }
  }
}
