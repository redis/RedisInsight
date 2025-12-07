import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'

import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import AiAssistant from './AiAssistant'

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    cloudSso: {
      flag: true,
    },
  }),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudUserSelector: jest.fn().mockReturnValue({
    data: null,
  }),
}))

describe('AiAssistant', () => {
  it('should render', () => {
    expect(render(<AiAssistant />)).toBeTruthy()
  })

  it('should render welcome screen with feature flag and unauthorized user', () => {
    render(<AiAssistant />)

    expect(screen.getByTestId('copilot-welcome')).toBeInTheDocument()
  })

  it('should not render welcome screen with feature flag and authorized user', () => {
    ;(oauthCloudUserSelector as jest.Mock).mockReturnValue({ data: {} })
    render(<AiAssistant />)

    expect(screen.queryByTestId('copilot-welcome')).not.toBeInTheDocument()
    expect(screen.getByTestId('chat-wrapper')).toBeInTheDocument()
  })

  it('should not render welcome screen without feature flag', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      cloudSso: { flag: false },
    })
    render(<AiAssistant />)

    expect(screen.queryByTestId('copilot-welcome')).not.toBeInTheDocument()
    expect(screen.getByTestId('chat-wrapper')).toBeInTheDocument()
  })
})
