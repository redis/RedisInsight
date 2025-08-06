import React, {
  MutableRefObject,
  Ref,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import cx from 'classnames'

import { throttle } from 'lodash'
import { RiIcon } from 'uiBase/icons'
import { RiLoader } from 'uiBase/display'
import {
  AiChatMessage,
  AiChatMessageType,
} from 'uiSrc/slices/interfaces/aiAssistant'
import { Nullable, scrollIntoView } from 'uiSrc/utils'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import LoadingMessage from '../loading-message'
import MarkdownMessage from '../markdown-message'
import ErrorMessage from '../error-message'

import styles from './styles.module.scss'

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
          <div
            className={cx({
              [styles.answerWrapper]:
                messageType === AiChatMessageType.AIMessage,
              [styles.questionWrapper]:
                messageType === AiChatMessageType.HumanMessage,
            })}
          >
            <div
              className={cx('jsx-markdown', {
                [styles.answer]: messageType === AiChatMessageType.AIMessage,
                [styles.question]:
                  messageType === AiChatMessageType.HumanMessage,
                [styles.error]: !!error,
              })}
              data-testid={`ai-message-${messageType}_${id}`}
            >
              {error && (
                <RiIcon type="ToastDangerIcon" className={styles.errorIcon} />
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
            </div>
          </div>
          <ErrorMessage error={error} onRestart={onRestart} />
        </React.Fragment>
      )
    },
    [modules],
  )

  if (isLoading) {
    return (
      <div className={cx(styles.wrapper, styles.loader)}>
        <RiLoader size="xl" data-testid="ai-loading-spinner" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.history} data-testid="ai-chat-empty-history">
          <div className={styles.answerWrapper}>
            <div
              className={styles.answer}
              data-testid="ai-message-initial-message"
            >
              {initialMessage}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { content } = inProgressMessage || {}

  return (
    <div className={styles.wrapper}>
      <div
        ref={listRef}
        className={styles.history}
        data-testid="ai-chat-history"
      >
        {history.map(getMessage)}
        {getMessage(inProgressMessage)}
        {content === '' && (
          <div className={styles.answerWrapper}>
            <div className={styles.answer} data-testid="ai-loading-answer">
              <LoadingMessage />
            </div>
          </div>
        )}
        <div className={styles.scrollAnchor} ref={scrollDivRef} />
      </div>
    </div>
  )
}

export default React.memo(ChatHistory)
