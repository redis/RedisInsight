import React, { CSSProperties, ReactNode } from 'react'
import cx from 'classnames'
import styles from 'uiSrc/components/database-overview/styles.module.scss'
import { IMetric } from 'uiSrc/components/database-overview/components/OverviewMetrics/OverviewMetrics'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'

export interface OverviewItemProps {
  children: ReactNode
  className?: string
  id?: string
  style?: CSSProperties
}
export const OverviewItem = ({
  children,
  className,
  id,
  style,
}: OverviewItemProps) => (
  <RiFlexItem
    className={cx(styles.overviewItem, className)}
    key={id}
    data-test-subj={id}
    data-testid={id}
    style={style}
  >
    {children}
  </RiFlexItem>
)

const MetricItem = (
  props: Partial<IMetric> & {
    tooltipContent?: ReactNode
    style?: CSSProperties
  },
) => {
  const { className = '', content, icon, id, tooltipContent, style } = props
  return (
    <OverviewItem id={id} className={className} style={style}>
      <RiTooltip
        position="bottom"
        className={styles.tooltip}
        content={tooltipContent}
      >
        <RiRow gap="none" responsive={false} align="center" justify="center">
          {icon && (
            <RiFlexItem className={styles.icon}>
              <RiIcon size="m" type={icon} className={styles.icon} />
            </RiFlexItem>
          )}
          <RiFlexItem className={styles.overviewItemContent}>
            {content}
          </RiFlexItem>
        </RiRow>
      </RiTooltip>
    </OverviewItem>
  )
}

export default MetricItem
