import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

import { AxiosError } from 'axios'
import {
  apiService,
  localStorageService,
  sessionStorageService,
} from 'uiSrc/services'
import { ApiEndpoints, BrowserStorageItem } from 'uiSrc/constants'
import {
  AiChatMessage,
  AiChatType,
  StateAiAssistant,
} from 'uiSrc/slices/interfaces/aiAssistant'
import {
  getApiErrorCode,
  getAxiosError,
  isStatusSuccessful,
  Maybe,
  parseCustomError,
} from 'uiSrc/utils'
import { getBaseUrl } from 'uiSrc/services/apiService'
import { getStreamedAnswer } from 'uiSrc/utils/api'
import ApiStatusCode from 'uiSrc/constants/apiStatusCode'
import {
  generateAiMessage,
  generateHumanMessage,
} from 'uiSrc/utils/transformers/chatbot'
import { logoutUserAction } from 'uiSrc/slices/oauth/cloud'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { EnhancedAxiosError } from 'uiSrc/slices/interfaces'
import { AppDispatch, RootState } from '../store'

const getTabSelected = (tab?: string): AiChatType => {
  if (Object.values(AiChatType).includes(tab as unknown as AiChatType))
    return tab as AiChatType
  return AiChatType.Assistance
}

export const initialState: StateAiAssistant = {
  activeTab: getTabSelected(
    sessionStorageService.get(BrowserStorageItem.selectedAiChat),
  ),
  assistant: {
    loading: false,
    agreements:
      localStorageService.get(BrowserStorageItem.generalChatAgreements) ??
      false,
    id: sessionStorageService.get(BrowserStorageItem.aiChatSession) ?? '',
    messages: [],
  },
  expert: {
    loading: false,
    agreements: [],
    messages: [],
  },
}

// A slice for recipes
const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
    setSelectedTab: (state, { payload }: PayloadAction<AiChatType>) => {
      state.activeTab = payload
      sessionStorageService.set(BrowserStorageItem.selectedAiChat, payload)
    },
    updateAssistantChatAgreements: (
      state,
      { payload }: PayloadAction<boolean>,
    ) => {
      state.assistant.agreements = payload
      localStorageService.set(BrowserStorageItem.generalChatAgreements, payload)
    },
    updateExpertChatAgreements: (state, { payload }: PayloadAction<string>) => {
      state.expert.agreements.push(payload)
    },
    createAssistantChat: (state) => {
      state.assistant.loading = true
      state.assistant.id = ''
      sessionStorageService.remove(BrowserStorageItem.aiChatSession)
    },
    createAssistantSuccess: (state, { payload }: PayloadAction<string>) => {
      state.assistant.id = payload
      state.assistant.loading = false

      sessionStorageService.set(BrowserStorageItem.aiChatSession, payload)
    },
    clearAssistantChatId: (state) => {
      state.assistant.id = ''
      sessionStorageService.remove(BrowserStorageItem.aiChatSession)
    },
    createAssistantFailed: (state) => {
      state.assistant.loading = false
    },
    getAssistantChatHistory: (state) => {
      state.assistant.loading = true
    },
    getAssistantChatHistorySuccess: (
      state,
      { payload }: PayloadAction<Array<AiChatMessage>>,
    ) => {
      state.assistant.loading = false
      state.assistant.messages =
        payload?.map((m) => ({ ...m, id: `ai_${uuidv4()}` })) || []
    },
    getAssistantChatHistoryFailed: (state) => {
      state.assistant.loading = false
    },
    removeAssistantChatHistory: (state) => {
      state.assistant.loading = true
    },
    removeAssistantChatHistorySuccess: (state) => {
      state.assistant.loading = false
      state.assistant.messages = []
      state.assistant.id = ''
      sessionStorageService.remove(BrowserStorageItem.aiChatSession)
    },
    removeAssistantChatHistoryFailed: (state) => {
      state.assistant.loading = false
    },
    sendQuestion: (state, { payload }: PayloadAction<AiChatMessage>) => {
      state.assistant.messages.push(payload)
    },
    setQuestionError: (
      state,
      {
        payload,
      }: PayloadAction<{
        id: string
        error: Maybe<{
          statusCode: number
          errorCode?: number
        }>
      }>,
    ) => {
      state.assistant.messages = state.assistant.messages.map((item) =>
        item.id === payload.id
          ? {
              ...item,
              error: payload.error,
            }
          : item,
      )
    },
    sendAnswer: (state, { payload }: PayloadAction<AiChatMessage>) => {
      state.assistant.messages.push(payload)
    },
    getExpertChatHistory: (state) => {
      state.expert.loading = true
    },
    getExpertChatHistorySuccess: (
      state,
      { payload }: PayloadAction<Array<AiChatMessage>>,
    ) => {
      state.expert.loading = false
      state.expert.messages =
        payload?.map((m) => ({ ...m, id: `ai_${uuidv4()}` })) || []
    },
    getExpertChatHistoryFailed: (state) => {
      state.expert.loading = false
    },
    sendExpertQuestion: (state, { payload }: PayloadAction<AiChatMessage>) => {
      state.expert.messages.push(payload)
    },
    setExpertQuestionError: (
      state,
      {
        payload,
      }: PayloadAction<{
        id: string
        error: Maybe<{
          statusCode: number
          errorCode?: number
          details?: Record<string, any>
        }>
      }>,
    ) => {
      state.expert.messages = state.expert.messages.map((item) =>
        item.id === payload.id
          ? {
              ...item,
              error: payload.error,
            }
          : item,
      )
    },
    sendExpertAnswer: (state, { payload }: PayloadAction<AiChatMessage>) => {
      state.expert.messages.push(payload)
    },
    clearExpertChatHistory: (state) => {
      state.expert.messages = []
    },
  },
})

// A selector
export const aiChatSelector = (state: RootState) => state.panels.aiAssistant
export const aiAssistantChatSelector = (state: RootState) =>
  state.panels.aiAssistant.assistant
export const aiExpertChatSelector = (state: RootState) =>
  state.panels.aiAssistant.expert

// Actions generated from the slice
export const {
  createAssistantChat,
  updateAssistantChatAgreements,
  updateExpertChatAgreements,
  clearAssistantChatId,
  setSelectedTab,
  createAssistantSuccess,
  createAssistantFailed,
  getAssistantChatHistory,
  getAssistantChatHistorySuccess,
  getAssistantChatHistoryFailed,
  removeAssistantChatHistory,
  removeAssistantChatHistorySuccess,
  removeAssistantChatHistoryFailed,
  sendQuestion,
  setQuestionError,
  sendAnswer,
  getExpertChatHistory,
  getExpertChatHistorySuccess,
  getExpertChatHistoryFailed,
  sendExpertQuestion,
  setExpertQuestionError,
  sendExpertAnswer,
  clearExpertChatHistory,
} = aiAssistantSlice.actions

// The reducer
export default aiAssistantSlice.reducer

export function createAssistantChatAction(
  onSuccess?: (chatId: string) => void,
  onFail?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(createAssistantChat())

    try {
      const { status, data } = await apiService.post<any>(
        ApiEndpoints.AI_ASSISTANT_CHATS,
      )

      if (isStatusSuccessful(status)) {
        dispatch(createAssistantSuccess(data.id))
        onSuccess?.(data.id)
      }
    } catch (e) {
      dispatch(createAssistantFailed())
      onFail?.()
    }
  }
}

export function askAssistantChatbot(
  id: string,
  message: string,
  {
    onMessage,
    onFinish,
    onError,
  }: {
    onMessage?: (message: AiChatMessage) => void
    onError?: (errorCode: number) => void
    onFinish?: () => void
  },
) {
  return async (dispatch: AppDispatch) => {
    const humanMessage = generateHumanMessage(message)
    const aiMessageProgressed = generateAiMessage()

    dispatch(sendQuestion(humanMessage))

    onMessage?.(aiMessageProgressed)

    const baseUrl = getBaseUrl()
    const url = `${baseUrl}${ApiEndpoints.AI_ASSISTANT_CHATS}/${id}/messages`

    await getStreamedAnswer(url, message, {
      onMessage: (value: string) => {
        aiMessageProgressed.content += value
        onMessage?.(aiMessageProgressed)
      },
      onFinish: () => {
        dispatch(sendAnswer(aiMessageProgressed))
        onFinish?.()
      },
      onError: (error: any) => {
        dispatch(
          setQuestionError({
            id: humanMessage.id,
            error: {
              statusCode: error?.status ?? 500,
              errorCode: error?.errorCode,
            },
          }),
        )
        onError?.(error?.status ?? 500)
        onFinish?.()
      },
    })
  }
}

export function getAssistantChatHistoryAction(
  id: string,
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getAssistantChatHistory())

    try {
      const { status, data } = await apiService.get<any>(
        `${ApiEndpoints.AI_ASSISTANT_CHATS}/${id}`,
      )

      if (isStatusSuccessful(status)) {
        dispatch(getAssistantChatHistorySuccess(data.messages))
        onSuccess?.()
      }
    } catch (e) {
      dispatch(getAssistantChatHistoryFailed())
      const error = e as AxiosError
      if (error?.response?.status === ApiStatusCode.Unauthorized) {
        dispatch(clearAssistantChatId())
      }
    }
  }
}

export function removeAssistantChatAction(id: string) {
  return async (dispatch: AppDispatch) => {
    dispatch(removeAssistantChatHistory())

    try {
      const { status } = await apiService.delete<any>(
        `${ApiEndpoints.AI_ASSISTANT_CHATS}/${id}`,
      )

      if (isStatusSuccessful(status)) {
        dispatch(removeAssistantChatHistorySuccess())
      }
    } catch (e) {
      dispatch(removeAssistantChatHistoryFailed())
    }
  }
}

export function getExpertChatHistoryAction(
  instanceId: string,
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getExpertChatHistory())

    try {
      const { status, data } = await apiService.get<any>(
        `${ApiEndpoints.AI_EXPERT}/${instanceId}/messages`,
      )

      if (isStatusSuccessful(status)) {
        dispatch(getExpertChatHistorySuccess(data))
        onSuccess?.()
      }
    } catch (error) {
      const err = getAxiosError(error as EnhancedAxiosError)
      const errorCode = getApiErrorCode(error as AxiosError)

      if (errorCode === ApiStatusCode.Unauthorized) {
        dispatch<any>(logoutUserAction())
      }

      dispatch(addErrorNotification(err))
      dispatch(getExpertChatHistoryFailed())
    }
  }
}

export function askExpertChatbotAction(
  databaseId: string,
  message: string,
  {
    onMessage,
    onError,
    onFinish,
  }: {
    onMessage?: (message: AiChatMessage) => void
    onError?: (errorCode: number) => void
    onFinish?: () => void
  },
) {
  return async (dispatch: AppDispatch) => {
    const humanMessage = generateHumanMessage(message)
    const aiMessageProgressed: AiChatMessage = generateAiMessage()

    dispatch(sendExpertQuestion(humanMessage))

    onMessage?.(aiMessageProgressed)

    const baseUrl = getBaseUrl()
    const url = `${baseUrl}${ApiEndpoints.AI_EXPERT}/${databaseId}/messages`

    await getStreamedAnswer(url, message, {
      onMessage: (value: string) => {
        aiMessageProgressed.content += value
        onMessage?.(aiMessageProgressed)
      },
      onFinish: () => {
        dispatch(sendExpertAnswer(aiMessageProgressed))
        onFinish?.()
      },
      onError: (error: any) => {
        if (error?.status === ApiStatusCode.Unauthorized) {
          const err = parseCustomError(error)
          dispatch(addErrorNotification(err))
          dispatch(logoutUserAction())
        } else {
          dispatch(
            setExpertQuestionError({
              id: humanMessage.id,
              error: {
                statusCode: error?.status ?? 500,
                errorCode: error?.errorCode,
                details: error?.details,
              },
            }),
          )
        }

        onError?.(error?.status ?? 500)
        onFinish?.()
      },
    })
  }
}

export function removeExpertChatHistoryAction(
  instanceId: string,
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    // dispatch(getExpertChatHistory())

    try {
      const { status } = await apiService.delete<any>(
        `${ApiEndpoints.AI_EXPERT}/${instanceId}/messages`,
      )

      if (isStatusSuccessful(status)) {
        dispatch(clearExpertChatHistory())
        onSuccess?.()
      }
    } catch (error) {
      const err = getAxiosError(error as EnhancedAxiosError)
      const errorCode = getApiErrorCode(error as AxiosError)

      if (errorCode === ApiStatusCode.Unauthorized) {
        dispatch<any>(logoutUserAction())
      }

      dispatch(addErrorNotification(err))
    }
  }
}
