import React from 'react'

import { RiSecondaryButton } from 'uiBase/forms'
import { DeleteIcon } from 'uiBase/icons'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { CustomErrorCodes } from 'uiSrc/constants'
import { AI_CHAT_ERRORS } from 'uiSrc/constants/apiErrors'
import ApiStatusCode from 'uiSrc/constants/apiStatusCode'

import RestartChat from '../restart-chat'

import styles from './styles.module.scss'

export interface Props {
  error?: {
    statusCode: number
    errorCode?: number
    details?: Record<string, any>
  }
  onRestart: () => void
}

const ERROR_CODES_WITHOUT_RESTART = [
  CustomErrorCodes.CloudApiUnauthorized,
  CustomErrorCodes.GeneralAiUnexpectedError,
  CustomErrorCodes.AiQueryRateLimitRequest,
  CustomErrorCodes.AiQueryRateLimitToken,
]

const ERROR_CODES_WITHOUT_REPORT_ISSUE = [
  CustomErrorCodes.AiQueryRateLimitRequest,
  CustomErrorCodes.AiQueryRateLimitToken,
  CustomErrorCodes.AiQueryRateLimitMaxTokens,
]

const ErrorMessage = (props: Props) => {
  const { error, onRestart } = props

  const getErrorMessage = (error?: {
    statusCode: number
    errorCode?: number
    details?: Record<string, any>
  }): string => {
    const { statusCode, errorCode, details } = error || {}

    if (statusCode === ApiStatusCode.Timeout) return AI_CHAT_ERRORS.timeout()
    if (errorCode === CustomErrorCodes.GeneralAiUnexpectedError)
      return AI_CHAT_ERRORS.unexpected()
    if (
      errorCode === CustomErrorCodes.AiQueryRateLimitRequest ||
      errorCode === CustomErrorCodes.AiQueryRateLimitToken
    )
      return AI_CHAT_ERRORS.rateLimit(details?.limiterSeconds)
    if (errorCode === CustomErrorCodes.AiQueryRateLimitMaxTokens)
      return AI_CHAT_ERRORS.tokenLimit()

    return AI_CHAT_ERRORS.default()
  }

  if (!error) return null

  const isShowRestart =
    !(
      error.errorCode && ERROR_CODES_WITHOUT_RESTART.includes(error.errorCode)
    ) && error.statusCode !== ApiStatusCode.Timeout
  const isShowReportIssue = !(
    error.errorCode &&
    ERROR_CODES_WITHOUT_REPORT_ISSUE.includes(error.errorCode)
  )

  return (
    <>
      <div className={styles.errorMessage} data-testid="ai-chat-error-message">
        {getErrorMessage(error)}
        {isShowReportIssue && (
          <>
            {' '}
            <a
              className="link-underline"
              href={EXTERNAL_LINKS.githubIssues}
              data-testid="ai-chat-error-report-link"
              target="_blank"
              rel="noreferrer"
            >
              report the issue
            </a>
          </>
        )}
      </div>
      {isShowRestart && (
        <RestartChat
          anchorClassName={styles.restartSessionWrapper}
          button={
            <RiSecondaryButton
              size="s"
              icon={DeleteIcon}
              className={styles.restartSessionBtn}
              data-testid="ai-chat-error-restart-session-btn"
            >
              Restart session
            </RiSecondaryButton>
          }
          onConfirm={onRestart}
        />
      )}
    </>
  )
}

export default ErrorMessage
