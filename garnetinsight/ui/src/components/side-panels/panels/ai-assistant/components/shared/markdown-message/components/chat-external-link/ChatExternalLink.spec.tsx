import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import ChatExternalLink from './ChatExternalLink'

describe('ChatExternalLink', () => {
  it('should render', () => {
    expect(render(<ChatExternalLink href="" />)).toBeTruthy()
  })

  it('should render proper link', () => {
    render(<ChatExternalLink href="https://localhost" />)

    expect(screen.getByTestId('chat-external-link')).toHaveAttribute(
      'href',
      'https://localhost/?utm_source=garnetinsight&utm_medium=app&utm_campaign=ai_assistant',
    )
  })
})
