import React from 'react'
import { RiText } from 'uiBase/text'
import { RiIcon } from 'uiBase/icons'
import { RiTooltip } from 'uiBase/display'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'

import styles from './styles.module.scss'

export interface PatternsInfoProps {
  channels?: string
}

const PatternsInfo = ({ channels }: PatternsInfoProps) => {
  const getChannelsCount = () => {
    if (!channels || channels?.trim() === DEFAULT_SEARCH_MATCH) return 'All'
    return channels.trim().split(' ').length
  }

  return (
    <div className={styles.patternsContainer}>
      <RiText color="subdued" size="s" data-testid="patterns-count">
        Patterns:&nbsp;{getChannelsCount()}{' '}
      </RiText>
      <RiTooltip
        anchorClassName={styles.appendIcon}
        position="right"
        title={
          <>
            {channels
              ?.trim()
              .split(' ')
              .map((ch) => <p key={`${ch}`}>{ch}</p>)}
          </>
        }
      >
        <RiIcon
          type="InfoIcon"
          style={{ cursor: 'pointer' }}
          data-testid="append-info-icon"
        />
      </RiTooltip>
    </div>
  )
}

export default PatternsInfo
