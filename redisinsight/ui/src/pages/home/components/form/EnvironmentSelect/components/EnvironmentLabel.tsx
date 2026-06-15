import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Text } from 'uiSrc/components/base/text/Text'

import EnvironmentTooltipContent from './EnvironmentTooltipContent'

const EnvironmentLabel = () => (
  <Row align="center" gap="s">
    <Text>Environment</Text>
    <RiTooltip position="right" content={<EnvironmentTooltipContent />}>
      <FlexItem>
        <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
      </FlexItem>
    </RiTooltip>
  </Row>
)

export default EnvironmentLabel
