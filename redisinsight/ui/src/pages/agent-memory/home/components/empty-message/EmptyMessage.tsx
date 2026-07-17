import React from 'react'

import { Text, Title } from 'uiSrc/components/base/text'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Link } from 'uiSrc/components/base/link'

import { EmptyPageContainer } from '../../AgentMemoryPage.styles'

export interface EmptyMessageProps {
  onAddClick: () => void
}

const AGENT_MEMORY_DOCS_URL = 'https://redis.io/agent-memory/'

const EmptyMessage = ({ onAddClick }: EmptyMessageProps) => (
  <EmptyPageContainer grow>
    <Col data-testid="agent-memory-empty-message" align="center" gap="xxl">
      <Spacer size="space400" />
      <FlexItem>
        <Col align="center" gap="m">
          <Title color="primary">Inspect your agent&apos;s memory</Title>
          <FlexItem>
            <Col align="center">
              <Text color="primary">
                <Link
                  href={AGENT_MEMORY_DOCS_URL}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="agent-memory-docs-link"
                >
                  Redis Agent Memory
                </Link>{' '}
                gives AI agents short-term memory for the active session,
              </Text>
              <Text color="primary">
                plus persistent long-term memory across sessions.
              </Text>
              <Spacer size="space100" />
              <Text color="primary">
                Connect to Redis Agent Memory to watch your agent&apos;s working
                memory in real time,
              </Text>
              <Text color="primary">
                inspect extracted facts, and debug what gets stored in long-term
                memory.
              </Text>
            </Col>
          </FlexItem>
        </Col>
      </FlexItem>
      <FlexItem>
        <PrimaryButton
          data-testid="agent-memory-empty-add-button"
          size="l"
          onClick={onAddClick}
        >
          Let&apos;s connect to Redis Agent Memory
        </PrimaryButton>
      </FlexItem>
      <Spacer size="space600" />
    </Col>
  </EmptyPageContainer>
)

export default EmptyMessage
