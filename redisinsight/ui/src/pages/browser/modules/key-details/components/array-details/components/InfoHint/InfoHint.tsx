import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons'

import { InfoHintProps } from './InfoHint.types'

export const InfoHint = ({ content }: InfoHintProps) => (
  <RiTooltip content={content} position="top" anchorClassName="inline-flex">
    <RiIcon type="InfoIcon" size="m" />
  </RiTooltip>
)
