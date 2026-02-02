import React, { CSSProperties, ReactNode } from 'react'
import cx from 'classnames'
import { IMetric } from 'uiSrc/components/database-overview/components/OverviewMetrics/OverviewMetrics'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import * as S from 'uiSrc/components/database-overview/DatabaseOverview.styles'

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
  <S.OverviewItem
    className={cx(className)}
    key={id}
    data-test-subj={id}
    data-testid={id}
    style={style}
  >
    {children}
  </S.OverviewItem>
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
        maxWidth={S.TOOLTIP_MAX_WIDTH}
        content={tooltipContent}
      >
        <Row gap="none" responsive={false} align="center" justify="center">
          {icon && (
            <FlexItem>
              <S.Icon>
                <RiIcon size="m" type={icon} />
              </S.Icon>
            </FlexItem>
          )}
          <S.OverviewItemContent>{content}</S.OverviewItemContent>
        </Row>
      </RiTooltip>
    </OverviewItem>
  )
}

export default MetricItem
