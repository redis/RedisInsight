import React from 'react'
import cx from 'classnames'
import { RiCol, RiFlexItem } from 'uiBase/layout'
import { RiIconButton } from 'uiBase/forms'
import { CancelSlimIcon } from 'uiBase/icons'
import { RiTitle, RiText } from 'uiBase/text'
import { RiLink } from 'uiBase/display'
import { getUtmExternalLink } from 'uiSrc/utils/links'
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
    <RiCol justify="center" className={cx(styles.container, 'relative')}>
      <div className={styles.headerWrapper}>
        <RiFlexItem grow style={{ marginBottom: '16px' }}>
          <RiTitle size="M" className={styles.header}>
            New Index
          </RiTitle>
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
        </RiFlexItem>
        <RiFlexItem grow className={styles.header}>
          <RiText size="s">
            Use CLI or Workbench to create more advanced indexes. See more
            details in the{' '}
            <RiLink
              color="text"
              href={getUtmExternalLink('https://redis.io/commands/ft.create/', {
                campaign: 'browser_search',
              })}
              className={styles.link}
              target="_blank"
            >
              documentation.
            </RiLink>
          </RiText>
        </RiFlexItem>
      </div>
      <CreateRedisearchIndex
        onCreateIndex={onCreateIndex}
        onClosePanel={onClosePanel}
      />
    </RiCol>
  </div>
)

export default CreateRedisearchIndexWrapper
