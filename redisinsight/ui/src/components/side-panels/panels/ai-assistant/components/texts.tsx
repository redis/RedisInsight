import React from 'react'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Link } from 'uiSrc/components/base/link/Link'
import { Text } from 'uiSrc/components/base/text'

export const ASSISTANCE_CHAT_AGREEMENTS = (
  <>
    <Text size="xs">
      Redis Copilot is powered by OpenAI API and is designed for general
      information only.
    </Text>
    <Spacer size="xs" />
    <Text size="xs">
      Please do not input any personal data or confidential information.
    </Text>
    <Spacer size="xs" />
    <Text size="xs">
      By accessing and/or using Redis Copilot, you acknowledge that you agree to
      the{' '}
      <Link
        variant="inline"
        size="S"
        color="subdued"
        target="_blank"
        href="https://redis.io/legal/redis-copilot-terms-of-use/"
      >
        REDIS COPILOT TERMS
      </Link>{' '}
      and{' '}
      <Link
        variant="inline"
        size="S"
        color="subdued"
        target="_blank"
        href="https://redis.com/legal/privacy-policy/"
      >
        Privacy Policy
      </Link>
      .
    </Text>
  </>
)

export const EXPERT_CHAT_AGREEMENTS = (
  <>
    <Text size="xs">Redis Copilot is powered by OpenAI API.</Text>
    <Spacer size="xs" />
    <Text size="xs">
      Please do not include any personal data (except as expressly required for
      the use of Redis Copilot) or confidential information.
    </Text>
    <Text size="xs">
      Redis Copilot needs access to the information in your database to provide
      you context-aware assistance.
    </Text>
    <Spacer size="xs" />
    <Text size="xs">
      By accepting these terms, you consent to the processing of any information
      included in your database, and you agree to the{' '}
      <Link
        variant="inline"
        size="S"
        color="subdued"
        target="_blank"
        href="https://redis.io/legal/redis-copilot-terms-of-use/"
      >
        REDIS COPILOT TERMS
      </Link>{' '}
      and{' '}
      <Link
        variant="inline"
        size="S"
        color="subdued"
        target="_blank"
        href="https://redis.com/legal/privacy-policy/"
      >
        Privacy Policy
      </Link>
      .
    </Text>
  </>
)

export const EXPERT_CHAT_INITIAL_MESSAGE = (
  <>
    <Text size="xs">Hi!</Text>
    <Text size="xs">I am here to help you get started with data querying.</Text>
    <Text size="xs">
      Type <b>/help</b> to get more info on what questions I can answer.
    </Text>
    <Spacer />
    <Text size="xs">
      With <span style={{ color: 'red' }}>&hearts;</span>, your Redis Copilot!
    </Text>
  </>
)
