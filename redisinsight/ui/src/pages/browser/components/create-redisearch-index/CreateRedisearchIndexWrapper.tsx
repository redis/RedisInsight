import React from 'react'
import cx from 'classnames'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { RiIconButton } from 'uiSrc/components/base/forms'
import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiTooltip } from 'uiSrc/components'
import CreateRedisearchIndex from './CreateRedisearchIndex'

import styles from './styles.module.scss'

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
  <div className={styles.page} data-testid="create-index-panel">
    <Col justify="center" className={cx(styles.container, 'relative')}>
      <div className={styles.headerWrapper}>
        <FlexItem grow style={{ marginBottom: '16px' }}>
          <Title size="M" className={styles.header}>
            New Index
          </Title>
          {!arePanelsCollapsed && (
            <RiTooltip
              content="Close"
              position="left"
              anchorClassName={styles.closeRightPanel}
            >
              <RiIconButton
                icon={CancelSlimIcon}
                aria-label="Close panel"
                className={styles.closeBtn}
                data-testid="create-index-close-panel"
                onClick={onClosePanel}
              />
            </RiTooltip>
          )}
        </FlexItem>
        <FlexItem grow className={styles.header}>
          <Text size="s">
            Use CLI or Workbench to create more advanced indexes. See more
            details in the{' '}
            <Link
              color="text"
              href={getUtmExternalLink('https://redis.io/commands/ft.create/', {
                campaign: 'browser_search',
              })}
              className={styles.link}
              target="_blank"
            >
              documentation.
            </Link>
          </Text>
        </FlexItem>
      </div>
      <CreateRedisearchIndex
        onCreateIndex={onCreateIndex}
        onClosePanel={onClosePanel}
      />
    </Col>
  </div>
)

export default CreateRedisearchIndexWrapper
