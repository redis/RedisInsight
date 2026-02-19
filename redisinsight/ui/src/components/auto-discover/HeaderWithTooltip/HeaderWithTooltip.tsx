import React from 'react'

import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'

export interface HeaderWithTooltipProps {
  title: string
  descriptions: Record<string, string>
}

export const HeaderWithTooltip = ({
  title,
  descriptions,
}: HeaderWithTooltipProps) => (
  <Row align="center" gap="s">
    <Text size="M" variant="semiBold">
      {title}
    </Text>
    <RiTooltip
      position="bottom"
      content={
        <Col gap="s">
          {Object.entries(descriptions).map(([status, description]) => (
            <Text key={status} size="S">
              <Text size="S" variant="semiBold" component="span">
                {status}:
              </Text>{' '}
              {description}
            </Text>
          ))}
        </Col>
      }
    >
      <RiIcon
        type="InfoIcon"
        size="m"
        data-testid={`${title.toLowerCase()}-info-icon`}
      />
    </RiTooltip>
  </Row>
)
