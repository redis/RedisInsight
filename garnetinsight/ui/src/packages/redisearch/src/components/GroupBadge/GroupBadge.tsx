import React from 'react'
import cx from 'classnames'

import { RiBadge } from '../../../../../components/base/display/badge/RiBadge'

import { GROUP_TYPES_COLORS, GROUP_TYPES_DISPLAY } from '../../constants'

export interface Props {
  type: any
  name?: string
  className?: string
}

const GroupBadge = ({ type, name = '', className = '' }: Props) => {
  // @ts-ignore
  const groupTypeDisplay = GROUP_TYPES_DISPLAY[type]
  // @ts-ignore
  const backgroundColor = GROUP_TYPES_COLORS[type] ?? '#14708D'
  return (
    <RiBadge
      style={{ backgroundColor, color: 'var(--euiTextSubduedColorHover)' }}
      className={cx(className, 'text-uppercase')}
      data-testid={`badge-${type} ${name}`}
      label={groupTypeDisplay ?? type}
    />
  )
}

export default GroupBadge
