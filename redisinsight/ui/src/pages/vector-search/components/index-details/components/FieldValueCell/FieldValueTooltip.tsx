import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'
import { useTranslation } from 'uiSrc/i18n'

export const FieldValueTooltip = () => {
  const { t } = useTranslation()

  return (
    <Col gap="m">
      <Text size="L" color="primary">
        {t('vectorSearch.indexDetails.fieldValueTooltip.title')}
      </Text>
      <Text color="secondary">
        {t('vectorSearch.indexDetails.fieldValueTooltip.description')}
      </Text>
    </Col>
  )
}
