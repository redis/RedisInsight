import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'
import { useTranslation } from 'uiSrc/i18n'

export const FieldNameTooltip = () => {
  const { t } = useTranslation()

  return (
    <Col gap="m">
      <Text size="L" color="primary">
        {t('vectorSearch.indexDetails.fieldNameTooltip.title')}
      </Text>
      <Text color="secondary">
        {t('vectorSearch.indexDetails.fieldNameTooltip.description')}
      </Text>
    </Col>
  )
}
