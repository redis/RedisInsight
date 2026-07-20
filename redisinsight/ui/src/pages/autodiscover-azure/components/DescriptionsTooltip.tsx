import React from 'react'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { StateDescription } from 'uiSrc/pages/autodiscover-azure/constants'

export interface DescriptionsTooltipProps {
  descriptions: StateDescription[]
}

export const DescriptionsTooltip = ({
  descriptions,
}: DescriptionsTooltipProps) => (
  <Col gap="s">
    {descriptions.map(({ label, description }) => (
      <Text key={label} size="S">
        <Text size="S" variant="semiBold" component="span">
          {label}:
        </Text>{' '}
        {description}
      </Text>
    ))}
  </Col>
)
