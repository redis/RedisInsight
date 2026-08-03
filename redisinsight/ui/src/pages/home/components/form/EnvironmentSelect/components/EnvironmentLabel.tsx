import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Text } from 'uiSrc/components/base/text/Text'
import { useTranslation } from 'uiSrc/i18n'

import EnvironmentTooltipContent from './EnvironmentTooltipContent'

const EnvironmentLabel = () => {
  const { t } = useTranslation()

  return (
    <Row align="center" gap="s">
      <Text>{t('home.form.environment.label')}</Text>
      <RiTooltip position="right" content={<EnvironmentTooltipContent />}>
        <FlexItem>
          <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
        </FlexItem>
      </RiTooltip>
    </Row>
  )
}

export default EnvironmentLabel
