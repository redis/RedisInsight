import { isString } from 'lodash'
import { ToolTipPositions } from '@elastic/eui/src/components/tool_tip/tool_tip'
import cx from 'classnames'
import React from 'react'
import { FeaturesHighlightingType } from 'uiSrc/constants/featuresHighlighting'
import { RiTooltip } from 'uiSrc/components'

import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import styles from './styles.module.scss'

export interface Props {
  isHighlight?: boolean
  children: React.ReactElement<any, any> | string
  title?: string | React.ReactElement
  content?: string | React.ReactElement
  type?: FeaturesHighlightingType
  transformOnHover?: boolean
  onClick?: () => void
  wrapperClassName?: string
  dotClassName?: string
  tooltipPosition?: ToolTipPositions
  hideFirstChild?: boolean
  dataTestPostfix?: string
}
const HighlightedFeature = (props: Props) => {
  const {
    isHighlight,
    children,
    title,
    content,
    type = 'plain',
    transformOnHover,
    onClick,
    wrapperClassName,
    dotClassName,
    tooltipPosition = 'bottom',
    hideFirstChild,
    dataTestPostfix = '',
  } = props

  const innerContent =
    hideFirstChild && !isString(children) ? children.props.children : children

  const BadgeHighlighting = () => (
    <>
      {innerContent}
      <RiBadge
        label="New!"
        className={styles.badge}
        data-testid="badge-highlighting"
      />
    </>
  )

  const DotHighlighting = () => (
    <>
      {innerContent}
      <span
        className={cx(styles.dot, dotClassName)}
        data-testid="dot-highlighting"
      />
    </>
  )

  const TooltipHighlighting = () => (
    <RiTooltip
      title={title}
      content={content}
      position={tooltipPosition}
      data-testid="tooltip-highlighting"
    >
      <div data-testid="tooltip-highlighting-inner">
        <DotHighlighting />
      </div>
    </RiTooltip>
  )

  const TooltipBadgeHighlighting = () => (
    <RiTooltip
      title={title}
      content={content}
      position={tooltipPosition}
      data-testid="tooltip-badge-highlighting"
    >
      <div
        className={styles.badgeContainer}
        data-testid="tooltip-badge-highlighting-inner"
      >
        <BadgeHighlighting />
      </div>
    </RiTooltip>
  )

  if (type === 'dialog') {
    return !isHighlight ? null : <>{children}</>
  }

  if (!isHighlight) return <>{children}</>

  return (
    <div
      className={cx(styles.wrapper, wrapperClassName, {
        'transform-on-hover': transformOnHover,
      })}
      onClick={() => onClick?.()}
      role="presentation"
      data-testid={`feature-highlighted-${dataTestPostfix}`}
    >
      {type === 'plain' && <DotHighlighting />}
      {type === 'tooltip' && <TooltipHighlighting />}
      {type === 'popover' && <DotHighlighting />}
      {type === 'tooltip-badge' && <TooltipBadgeHighlighting />}
    </div>
  )
}

export default HighlightedFeature
