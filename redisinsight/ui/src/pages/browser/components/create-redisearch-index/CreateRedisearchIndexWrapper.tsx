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

import { Spacer } from 'uiSrc/components/base/layout'
import Divider from 'uiSrc/components/divider/Divider'
import styles from 'uiSrc/pages/browser/components/add-key/styles.module.scss'

const StyledCreateRedisearchIndexWrapper = styled(Col)`
  background-color: ${({ theme }) =>
    theme.name === 'light'
      ? theme.semantic.color.background.neutral100
      : theme.semantic.color.background.neutral200};
  padding: ${({ theme }) => theme.core.space.space200};
  width: 100%;
  height: 100%;
`

const StyledHeader = styled(Col)`
  flex: 0 0 auto;
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
    <StyledHeader>
      <Spacer size="m" />
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
      <Spacer size="xl" />
      <FlexItem>
        <Text size="s">
          Use CLI or Workbench to create more advanced indexes. See more details
          in the{' '}
          <Link
            variant="inline"
            size="S"
            href={getUtmExternalLink('https://redis.io/commands/ft.create/', {
              campaign: 'browser_search',
            })}
            target="_blank"
            color="primary"
          >
            documentation.
          </Link>
        </Text>
      </FlexItem>
    </StyledHeader>
    <Divider colorVariable="separatorColor" className={styles.divider} />
    <CreateRedisearchIndex
      onCreateIndex={onCreateIndex}
      onClosePanel={onClosePanel}
    />
  </StyledCreateRedisearchIndexWrapper>
)

export default CreateRedisearchIndexWrapper
