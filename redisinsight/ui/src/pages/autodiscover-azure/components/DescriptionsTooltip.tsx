import React from 'react'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export interface DescriptionsTooltipProps {
  descriptions: Record<string, string>
}

export const DescriptionsTooltip = ({
  descriptions,
}: DescriptionsTooltipProps) => (
  <Col gap="s">
    {Object.entries(descriptions).map(([key, description]) => (
      <Text key={key} size="S">
        <Text size="S" variant="semiBold" component="span">
          {key}:
        </Text>{' '}
        {description}
      </Text>
    ))}
  </Col>
)
