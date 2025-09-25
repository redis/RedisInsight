import React from 'react'
import styled from 'styled-components'

import { getUtmExternalLink } from 'uiSrc/utils/links'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiTooltip } from 'uiSrc/components'
import CreateRedisearchIndex from './CreateRedisearchIndex'

import { HorizontalRule, Spacer } from 'uiSrc/components/base/layout'

const StyledCreateRedisearchIndexWrapper = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space200};
  width: 100%;
  height: 100%;
`

export interface Props {
  arePanelsCollapsed?: boolean
  onClosePanel?: () => void
  onCreateIndex?: () => void
}

const CreateRedisearchIndexWrapper = ({
  arePanelsCollapsed,
  onClosePanel,
  onCreateIndex,
}: Props) => (
  <StyledCreateRedisearchIndexWrapper data-testid="create-index-panel">
    <Col grow={false}>
      <Row justify="between">
        <Title size="M">New Index</Title>
        {!arePanelsCollapsed && (
          <RiTooltip content="Close" position="left">
            <IconButton
              size="L"
              icon={CancelSlimIcon}
              aria-label="Close panel"
              data-testid="create-index-close-panel"
              onClick={onClosePanel}
            />
          </RiTooltip>
        )}
      </Row>
      <Spacer size="l" />
      <FlexItem>
        <Text size="s">
          Use CLI or Workbench to create more advanced indexes. See more details
          in the{' '}
          <Link
            variant="small-inline"
            href={getUtmExternalLink('https://redis.io/commands/ft.create/', {
              campaign: 'browser_search',
            })}
            target="_blank"
          >
            documentation.
          </Link>
        </Text>
      </FlexItem>
    </Col>
    <HorizontalRule margin="l" />
    <CreateRedisearchIndex
      onCreateIndex={onCreateIndex}
      onClosePanel={onClosePanel}
    />
  </StyledCreateRedisearchIndexWrapper>
)

export default CreateRedisearchIndexWrapper
