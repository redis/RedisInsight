import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  aiAgentChatSelector,
  askAgentChatbotAction,
  getAgentChatHistoryAction,
  removeAgentChatHistoryAction,
} from 'uiSrc/slices/panels/aiAssistant'
import { getCommandsFromQuery, Nullable } from 'uiSrc/utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatMessage, AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'

import { RestartChat } from 'uiSrc/components/side-panels/panels/ai-assistant/components/shared'
import { Row } from 'uiSrc/components/base/layout/flex'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { EraserIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components/base'
import { ChatForm, ChatHistory } from '../shared'

import styles from './styles.module.scss'

const AGENT_CHAT_INITIAL_MESSAGE = (
  <>
    <Text size="xs">Hi!</Text>
    <Text size="xs">
      I am your Redis Agent. I can execute commands, analyze your database,
      diagnose performance, load sample data, and more.
    </Text>
    <Text size="xs">
      Try asking me: &quot;Give me an overview of this database&quot; or
      &quot;Load sample data and show me how to query it&quot;.
    </Text>
  </>
)

const AgentChat = () => {
  const { messages, loading } = useSelector(aiAgentChatSelector)
  const {
    name: connectedInstanceName,
    modules,
    provider,
  } = useSelector(connectedInstanceSelector)
  const { commandsArray: REDIS_COMMANDS_ARRAY } = useSelector(
    appRedisCommandsSelector,
  )

  const [inProgressMessage, setInProgressMessage] =
    useState<Nullable<AiChatMessage>>(null)

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    if (!instanceId) return
    dispatch(getAgentChatHistoryAction(instanceId))
  }, [instanceId])

  const handleSubmit = useCallback(
    (message: string) => {
      dispatch(
        askAgentChatbotAction(instanceId, message, {
          onMessage: (msg: AiChatMessage) => setInProgressMessage({ ...msg }),
          onError: (errorCode: number) => {
            sendEventTelemetry({
              event: TelemetryEvent.AI_CHAT_BOT_ERROR_MESSAGE_RECEIVED,
              eventData: {
                chat: AiChatType.Agent,
                errorCode,
              },
            })
          },
          onFinish: () => setInProgressMessage(null),
        }),
      )

      sendEventTelemetry({
        event: TelemetryEvent.AI_CHAT_MESSAGE_SENT,
        eventData: {
          chat: AiChatType.Agent,
        },
      })
    },
    [instanceId],
  )

  const onRunCommand = useCallback(
    (query: string) => {
      const command = getCommandsFromQuery(query, REDIS_COMMANDS_ARRAY) || ''
      sendEventTelemetry({
        event: TelemetryEvent.AI_CHAT_BOT_COMMAND_RUN_CLICKED,
        eventData: {
          databaseId: instanceId,
          chat: AiChatType.Agent,
          provider,
          command,
        },
      })
    },
    [instanceId, provider],
  )

  const onClearSession = useCallback(() => {
    dispatch(removeAgentChatHistoryAction(instanceId))

    sendEventTelemetry({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: { chat: AiChatType.Agent },
    })
  }, [instanceId])

  const getValidationMessage = () => {
    if (!instanceId) {
      return {
        title: 'Open a database',
        content: 'Open your Redis database to start using the Agent.',
      }
    }

    return undefined
  }

  return (
    <div className={styles.wrapper} data-testid="ai-agent-chat">
      <div className={styles.header}>
        {connectedInstanceName ? (
          <RiTooltip
            content={connectedInstanceName}
            anchorClassName={styles.dbName}
          >
            <Text size="xs" className="truncateText">
              {connectedInstanceName}
            </Text>
          </RiTooltip>
        ) : (
          <span />
        )}
        <Row>
          <RestartChat
            button={
              <EmptyButton
                disabled={!messages?.length || !instanceId}
                icon={EraserIcon}
                size="small"
                data-testid="ai-agent-restart-session-btn"
              />
            }
            onConfirm={onClearSession}
          />
        </Row>
      </div>
      <div className={styles.chatHistory}>
        <ChatHistory
          autoScroll
          isLoading={loading}
          modules={modules}
          initialMessage={AGENT_CHAT_INITIAL_MESSAGE}
          inProgressMessage={inProgressMessage}
          history={messages}
          onRunCommand={onRunCommand}
          onRestart={onClearSession}
        />
      </div>
      <div className={styles.chatForm}>
        <ChatForm
          isDisabled={!instanceId || inProgressMessage?.content === ''}
          validation={getValidationMessage()}
          placeholder="Ask me to do anything with your database..."
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default AgentChat
