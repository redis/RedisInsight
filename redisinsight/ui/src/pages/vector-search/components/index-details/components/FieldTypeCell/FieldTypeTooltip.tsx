import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'
import { useTranslation } from 'uiSrc/i18n'
import { IndexingTypeContent } from '../../../../components/field-type-list'

export const FieldTypeTooltip = () => {
  const { t } = useTranslation()

  return (
    <Col gap="m">
      <Text size="L" color="primary">
        {t('vectorSearch.indexDetails.fieldTypeTooltip.title')}
      </Text>
      <IndexingTypeContent />
    </Col>
  )
}
