import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  aiAssistantChatSelector,
  askAssistantChatbot,
  createAssistantChatAction,
  getAssistantChatHistoryAction,
  removeAssistantChatAction,
  removeAssistantChatHistorySuccess,
  sendQuestion,
  updateAssistantChatAgreements,
} from 'uiSrc/slices/panels/aiAssistant'
import { getCommandsFromQuery, Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatMessage, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'

import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'

import { generateHumanMessage } from 'uiSrc/utils/transformers/chatbot'

import { CustomErrorCodes } from 'uiSrc/constants'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { EraserIcon } from 'uiSrc/components/base/icons'
import { ASSISTANCE_CHAT_AGREEMENTS } from '../texts'
import {
  AssistanceChatInitialMessage,
  ChatForm,
  ChatHistory,
  RestartChat,
} from '../shared'

import styles from './styles.module.scss'

const AssistanceChat = () => {
  const { id, messages, agreements, loading } = useSelector(
    aiAssistantChatSelector,
  )
  const { modules, provider } = useSelector(connectedInstanceSelector)
  const { commandsArray: REDIS_COMMANDS_ARRAY } = useSelector(
    appRedisCommandsSelector,
  )

  const [inProgressMessage, setinProgressMessage] =
    useState<Nullable<AiChatMessage>>(null)
  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    if (!id || messages.length) return

    dispatch(getAssistantChatHistoryAction(id))
  }, [id])

  const handleSubmit = useCallback(
    (message: string) => {
      if (!agreements) {
        dispatch(updateAssistantChatAgreements(true))
        sendEventTelemetry({
          event: TelemetryEvent.AI_CHAT_BOT_TERMS_ACCEPTED,
          eventData: {
            chat: AiChatType.Assistance,
          },
        })
      }

      if (!id) {
        dispatch(
          createAssistantChatAction(
            (chatId) => sendChatMessage(chatId, message),
            // if cannot create a chat - just put message with error
            () => {
              dispatch(
                sendQuestion({
                  ...generateHumanMessage(message),
                  error: {
                    statusCode: 500,
                    errorCode: CustomErrorCodes.QueryAiInternalServerError,
                  },
                }),
              )

              sendEventTelemetry({
                event: TelemetryEvent.AI_CHAT_BOT_ERROR_MESSAGE_RECEIVED,
                eventData: {
                  chat: AiChatType.Assistance,
                  errorCode: 500,
                },
              })
            },
          ),
        )
        return
      }

      sendChatMessage(id, message)
    },
    [id, agreements],
  )

  const sendChatMessage = (chatId: string, message: string) => {
    dispatch(
      askAssistantChatbot(chatId, message, {
        onMessage: (message: AiChatMessage) => {
          setinProgressMessage({ ...message })
        },
        onError: (errorCode: number) => {
          sendEventTelemetry({
            event: TelemetryEvent.AI_CHAT_BOT_ERROR_MESSAGE_RECEIVED,
            eventData: {
              chat: AiChatType.Assistance,
              errorCode,
            },
          })
        },
        onFinish: () => setinProgressMessage(null),
      }),
    )

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_MESSAGE_SENT,
      eventData: {
        chat: AiChatType.Assistance,
      },
    })
  }

  const onClearSession = useCallback(() => {
    if (!id) {
      dispatch(removeAssistantChatHistorySuccess())
      return
    }

    dispatch(removeAssistantChatAction(id))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chat: AiChatType.Assistance,
      },
    })
  }, [id])

  const onRunCommand = useCallback(
    (query: string) => {
      const command = getCommandsFromQuery(query, REDIS_COMMANDS_ARRAY) || ''
      sendEventTelemetry({
        event: TelemetryEvent.AI_CHAT_BOT_COMMAND_RUN_CLICKED,
        eventData: {
          databaseId: instanceId,
          chat: AiChatType.Assistance,
          provider,
          command,
        },
      })
    },
    [instanceId, provider],
  )

  const handleAgreementsDisplay = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_BOT_TERMS_DISPLAYED,
      eventData: {
        chat: AiChatType.Assistance,
      },
    })
  }, [])

  return (
    <div className={styles.wrapper} data-testid="ai-general-chat">
      <div className={styles.header}>
        <span />
        <RestartChat
          button={
            <EmptyButton
              disabled={!!inProgressMessage || !messages?.length}
              icon={EraserIcon}
              size="small"
              className={styles.headerBtn}
              data-testid="ai-general-restart-session-btn"
            />
          }
          onConfirm={onClearSession}
        />
      </div>
      <div className={styles.chatHistory}>
        <ChatHistory
          autoScroll
          isLoading={loading}
          modules={modules}
          initialMessage={AssistanceChatInitialMessage}
          inProgressMessage={inProgressMessage}
          history={messages}
          onRunCommand={onRunCommand}
          onRestart={onClearSession}
        />
      </div>
      <div className={styles.chatForm}>
        <ChatForm
          onAgreementsDisplayed={handleAgreementsDisplay}
          agreements={!agreements ? ASSISTANCE_CHAT_AGREEMENTS : undefined}
          placeholder="Ask me about Redis"
          isDisabled={inProgressMessage?.content === ''}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default AssistanceChat
