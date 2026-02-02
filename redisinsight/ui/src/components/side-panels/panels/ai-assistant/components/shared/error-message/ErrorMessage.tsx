import React from 'react'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { CustomErrorCodes } from 'uiSrc/constants'
import { AI_CHAT_ERRORS } from 'uiSrc/constants/apiErrors'
import ApiStatusCode from 'uiSrc/constants/apiStatusCode'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import RestartChat from '../restart-chat'
import * as S from '../../../../../SidePanels.styles'

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
  CustomErrorCodes.QueryAiInternalServerError,
  CustomErrorCodes.QueryAiRateLimitRequest,
  CustomErrorCodes.QueryAiRateLimitToken,
]

const ERROR_CODES_WITHOUT_REPORT_ISSUE = [
  CustomErrorCodes.QueryAiRateLimitRequest,
  CustomErrorCodes.QueryAiRateLimitToken,
  CustomErrorCodes.QueryAiRateLimitMaxTokens,
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
    if (errorCode === CustomErrorCodes.QueryAiInternalServerError)
      return AI_CHAT_ERRORS.unexpected()
    if (
      errorCode === CustomErrorCodes.QueryAiRateLimitRequest ||
      errorCode === CustomErrorCodes.QueryAiRateLimitToken
    )
      return AI_CHAT_ERRORS.rateLimit(details?.limiterSeconds)
    if (errorCode === CustomErrorCodes.QueryAiRateLimitMaxTokens)
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
      <S.ErrorMessage data-testid="ai-chat-error-message">
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
      </S.ErrorMessage>
      {isShowRestart && (
        <S.RestartSessionWrapper>
          <RestartChat
            button={
              <S.RestartSessionBtn
                as={SecondaryButton}
                size="s"
                icon={DeleteIcon}
                data-testid="ai-chat-error-restart-session-btn"
              >
                Restart session
              </S.RestartSessionBtn>
            }
            onConfirm={onRestart}
          />
        </S.RestartSessionWrapper>
      )}
    </>
  )
}

export default ErrorMessage
