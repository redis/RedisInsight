import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'

import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Row } from 'uiSrc/components/base/layout/flex'
import { HorizontalSpacer } from 'uiSrc/components/base/layout'

export interface PatternsInfoProps {
  channels?: string
}

const PatternsInfo = ({ channels }: PatternsInfoProps) => {
  const getChannelsCount = () => {
    if (!channels || channels?.trim() === DEFAULT_SEARCH_MATCH) return 'All'
    return channels.trim().split(' ').length
  }

  return (
    <Row grow={false} align="center">
      <Text data-testid="patterns-count">
        Patterns:&nbsp;{getChannelsCount()}
      </Text>

      <HorizontalSpacer size="s" />

      <RiTooltip
        position="right"
        title={
          <>
            {channels
              ?.trim()
              .split(' ')
              .map((ch) => <Text key={`${ch}`}>{ch}</Text>)}
          </>
        }
      >
        <RiIcon
          type="InfoIcon"
          // TODO: Remove marginTop
          // Hack: for some reason this icon has extra height, which breaks flex alignment
          style={{ cursor: 'pointer', marginTop: 4 }}
          data-testid="append-info-icon"
        />
      </RiTooltip>
    </Row>
  )
}

export default PatternsInfo
