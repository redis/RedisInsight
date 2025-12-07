import React, {
  MutableRefObject,
  Ref,
  useCallback,
  useEffect,
  useRef,
} from 'react'

import { throttle } from 'lodash'
import {
  AiChatMessage,
  AiChatMessageType,
} from 'uiSrc/slices/interfaces/aiAssistant'
import { Nullable, scrollIntoView } from 'uiSrc/utils'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Loader } from 'uiSrc/components/base/display'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import LoadingMessage from '../loading-message'
import MarkdownMessage from '../markdown-message'
import ErrorMessage from '../error-message'

import {
  HistoryContainer,
  HistoryWrapper,
  MessageContainer,
  MessageWrapper,
} from './ChatHistory.styles'

export interface Props {
  autoScroll?: boolean
  isLoading?: boolean
  initialMessage: React.ReactNode
  inProgressMessage?: Nullable<AiChatMessage>
  modules?: AdditionalRedisModule[]
  history: AiChatMessage[]
  onMessageRendered?: () => void
  onRunCommand?: (query: string) => void
  onRestart: () => void
}

const SCROLL_THROTTLE_MS = 200

const ChatHistory = (props: Props) => {
  const {
    autoScroll,
    isLoading,
    initialMessage,
    inProgressMessage,
    modules,
    history = [],
    onMessageRendered,
    onRunCommand,
    onRestart,
  } = props

  const scrollDivRef: Ref<HTMLDivElement> = useRef(null)
  const listRef: Ref<HTMLDivElement> = useRef(null)
  const observerRef: MutableRefObject<Nullable<MutationObserver>> = useRef(null)
  const scrollBehavior = useRef<ScrollBehavior>('auto')

  useEffect(() => {
    if (!autoScroll) return undefined
    if (!listRef.current) return undefined

    scrollBehavior.current = inProgressMessage ? 'smooth' : 'auto'

    if (!inProgressMessage) scrollToBottom()
    if (inProgressMessage?.content === '') scrollToBottomThrottled()

    if (!observerRef.current) {
      const observerCallback: MutationCallback = (mutationsList) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            scrollBehavior.current === 'smooth'
              ? scrollToBottomThrottled()
              : scrollToBottom()
            break
          }
        }
      }

      observerRef.current = new MutationObserver(observerCallback)
    }

    observerRef.current.observe(listRef.current, {
      childList: true,
      subtree: true,
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [autoScroll, inProgressMessage, history])

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    requestAnimationFrame(() => {
      scrollIntoView(scrollDivRef?.current, {
        behavior,
        block: 'start',
        inline: 'start',
      })
    })
  }
  const scrollToBottomThrottled = throttle(
    () => scrollToBottom('smooth'),
    SCROLL_THROTTLE_MS,
  )

  const getMessage = useCallback(
    (message?: Nullable<AiChatMessage>) => {
      if (!message) return null

      const { id, content, error, type: messageType } = message
      if (!content) return null

      return (
        <React.Fragment key={id}>
          <MessageWrapper as="div" messageType={messageType}>
            <MessageContainer
              as="div"
              className="jsx-markdown"
              messageType={messageType}
              hasError={!!error}
              data-testid={`ai-message-${messageType}_${id}`}
            >
              {error && (
                <RiIcon type="ToastDangerIcon" size="M" color="danger500" />
              )}
              {messageType === AiChatMessageType.HumanMessage ? (
                content
              ) : (
                <MarkdownMessage
                  onRunCommand={onRunCommand}
                  onMessageRendered={onMessageRendered}
                  modules={modules}
                >
                  {content}
                </MarkdownMessage>
              )}
            </MessageContainer>
          </MessageWrapper>
          <ErrorMessage error={error} onRestart={onRestart} />
        </React.Fragment>
      )
    },
    [modules],
  )

  if (isLoading) {
    return (
      <HistoryWrapper>
        <Loader size="xl" data-testid="ai-loading-spinner" />
      </HistoryWrapper>
    )
  }

  if (history.length === 0) {
    return (
      <HistoryWrapper>
        <HistoryContainer as="div" data-testid="ai-chat-empty-history">
          <MessageWrapper as="div" messageType={AiChatMessageType.AIMessage}>
            <MessageContainer
              as="div"
              messageType={AiChatMessageType.AIMessage}
              data-testid="ai-message-initial-message"
            >
              {initialMessage}
            </MessageContainer>
          </MessageWrapper>
        </HistoryContainer>
      </HistoryWrapper>
    )
  }

  const { content } = inProgressMessage || {}

  return (
    <HistoryWrapper>
      <HistoryContainer as="div" ref={listRef} data-testid="ai-chat-history">
        {history.map(getMessage)}
        {getMessage(inProgressMessage)}
        {content === '' && (
          <MessageWrapper as="div" messageType={AiChatMessageType.AIMessage}>
            <MessageContainer
              as="div"
              messageType={AiChatMessageType.AIMessage}
              data-testid="ai-loading-answer"
            >
              <LoadingMessage />
            </MessageContainer>
          </MessageWrapper>
        )}
        <div ref={scrollDivRef} />
      </HistoryContainer>
    </HistoryWrapper>
  )
}

export default React.memo(ChatHistory)
