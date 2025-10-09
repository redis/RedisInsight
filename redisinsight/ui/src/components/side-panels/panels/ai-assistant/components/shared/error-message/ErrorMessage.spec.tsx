import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { AI_CHAT_ERRORS } from 'uiSrc/constants/apiErrors'
import { CustomErrorCodes } from 'uiSrc/constants'
import ErrorMessage from './ErrorMessage'

describe('ErrorMessage', () => {
  it('should render', () => {
    expect(render(<ErrorMessage onRestart={jest.fn} />)).toBeTruthy()
  })

  it('should render error', () => {
    const onRestart = jest.fn()
    render(<ErrorMessage onRestart={onRestart} error={{ statusCode: 404 }} />)

    expect(screen.getByTestId('ai-chat-error-message')).toHaveTextContent(
      AI_CHAT_ERRORS.default(),
    )
    expect(screen.getByTestId('ai-chat-error-report-link')).toBeInTheDocument()

    expect(
      screen.getByTestId('ai-chat-error-restart-session-btn'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('ai-chat-error-report-link')).toBeInTheDocument()
  })

  it('should render rate limit error', () => {
    const error = {
      errorCode: CustomErrorCodes.QueryAiRateLimitRequest,
      statusCode: 429,
      details: {
        limiterType: 'request',
        limiterKind: 'user',
        limiterSeconds: 100,
      },
    }
    render(<ErrorMessage onRestart={jest.fn} error={error} />)

    expect(screen.getByTestId('ai-chat-error-message')).toHaveTextContent(
      'Exceeded rate limit. Try again in 1 minute.',
    )

    expect(
      screen.queryByTestId('ai-chat-error-restart-session-btn'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByTestId('ai-chat-error-report-link'),
    ).not.toBeInTheDocument()
  })

  it('should render tokens limit error', () => {
    const error = {
      errorCode: CustomErrorCodes.QueryAiRateLimitMaxTokens,
      statusCode: 413,
      details: { tokenLimit: 20000, tokenCount: 575 },
    }
    render(<ErrorMessage onRestart={jest.fn} error={error} />)

    expect(screen.getByTestId('ai-chat-error-message')).toHaveTextContent(
      AI_CHAT_ERRORS.tokenLimit(),
    )

    expect(
      screen.getByTestId('ai-chat-error-restart-session-btn'),
    ).toBeInTheDocument()
    expect(
      screen.queryByTestId('ai-chat-error-report-link'),
    ).not.toBeInTheDocument()
  })

  it('should not render restart button with timeout error', () => {
    const onRestart = jest.fn()
    render(<ErrorMessage onRestart={onRestart} error={{ statusCode: 408 }} />)

    expect(screen.getByTestId('ai-chat-error-message')).toHaveTextContent(
      AI_CHAT_ERRORS.timeout(),
    )
    expect(screen.getByTestId('ai-chat-error-report-link')).toBeInTheDocument()

    expect(
      screen.queryByTestId('ai-chat-error-restart-session-btn'),
    ).not.toBeInTheDocument()
  })
})
