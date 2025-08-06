import { EuiLink } from '@elastic/eui'
import React from 'react'

import { RiSpacer } from 'uiBase/layout/spacer'
import { RiLink } from 'uiBase/display'
import { RiText } from 'uiBase/text'

export const ASSISTANCE_CHAT_AGREEMENTS = (
  <>
    <RiText size="xs">
      Redis Copilot is powered by OpenAI API and is designed for general
      information only.
    </RiText>
    <RiSpacer size="xs" />
    <RiText size="xs">
      Please do not input any personal data or confidential information.
    </RiText>
    <RiSpacer size="xs" />
    <RiText size="xs">
      By accessing and/or using Redis Copilot, you acknowledge that you agree to
      the{' '}
      <RiLink
        color="subdued"
        target="_blank"
        href="https://redis.io/legal/redis-copilot-terms-of-use/"
      >
        REDIS COPILOT TERMS
      </RiLink>{' '}
      and{' '}
      <RiLink
        color="subdued"
        target="_blank"
        href="https://redis.com/legal/privacy-policy/"
      >
        Privacy Policy
      </RiLink>
      .
    </RiText>
  </>
)

export const EXPERT_CHAT_AGREEMENTS = (
  <>
    <RiText size="xs">Redis Copilot is powered by OpenAI API.</RiText>
    <RiSpacer size="xs" />
    <RiText size="xs">
      Please do not include any personal data (except as expressly required for
      the use of Redis Copilot) or confidential information.
    </RiText>
    <RiText size="xs">
      Redis Copilot needs access to the information in your database to provide
      you context-aware assistance.
    </RiText>
    <RiSpacer size="xs" />
    <RiText size="xs">
      By accepting these terms, you consent to the processing of any information
      included in your database, and you agree to the{' '}
      <RiLink
        color="subdued"
        target="_blank"
        href="https://redis.io/legal/redis-copilot-terms-of-use/"
      >
        REDIS COPILOT TERMS
      </RiLink>{' '}
      and{' '}
      <RiLink
        color="subdued"
        target="_blank"
        href="https://redis.com/legal/privacy-policy/"
      >
        Privacy Policy
      </RiLink>
      .
    </RiText>
  </>
)

export const EXPERT_CHAT_INITIAL_MESSAGE = (
  <>
    <RiText size="xs">Hi!</RiText>
    <RiText size="xs">
      I am here to help you get started with data querying.
    </RiText>
    <RiText size="xs">
      Type <b>/help</b> to get more info on what questions I can answer.
    </RiText>
    <RiSpacer />
    <RiText size="xs">
      With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!
    </RiText>
  </>
)
