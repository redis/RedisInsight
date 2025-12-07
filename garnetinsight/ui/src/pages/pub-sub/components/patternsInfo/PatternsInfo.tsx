import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'

import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'
import { HorizontalSpacer } from 'uiSrc/components/base/layout'
import { InfoIcon } from './PatternsInfo.styles'

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
        <InfoIcon />
      </RiTooltip>
    </Row>
  )
}

export default PatternsInfo
