import React, { ReactNode } from 'react'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiTooltip } from 'uiSrc/components/base/tooltip'
import { InfoIcon } from 'uiSrc/components/base/icons'

export interface ColumnHeaderProps {
  label: ReactNode
  tooltip: ReactNode
}

export const ColumnHeader = ({ label, tooltip }: ColumnHeaderProps) => (
  <Row gap="xs" align="center">
    {label}
    <RiTooltip content={tooltip}>
      <FlexItem>
        <InfoIcon />
      </FlexItem>
    </RiTooltip>
  </Row>
)
