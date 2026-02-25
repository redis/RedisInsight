import React, { CSSProperties, ReactNode } from 'react'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { type IMetric } from './OverviewMetrics.types'
import * as S from '../../DatabaseOverview.styles'

const TOOLTIP_MAX_WIDTH = '372px'

const MetricItem = (
  props: Partial<IMetric> & {
    tooltipContent?: ReactNode
    style?: CSSProperties
  },
) => {
  const { className = '', content, icon, id, tooltipContent, style } = props
  return (
    <S.OverviewItem
      className={className}
      key={id}
      data-test-subj={id}
      data-testid={id}
      style={style}
    >
      <RiTooltip
        position="bottom"
        maxWidth={TOOLTIP_MAX_WIDTH}
        content={tooltipContent}
      >
        <Row gap="none" centered>
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
    </S.OverviewItem>
  )
}

export default MetricItem
