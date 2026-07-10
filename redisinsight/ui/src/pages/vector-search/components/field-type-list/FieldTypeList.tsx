import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'
import { FieldTag } from 'uiSrc/pages/vector-search/components/field-tag/FieldTag'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import * as S from './FieldTypeList.styles'

const FIELD_TYPE_DESCRIPTION_KEYS: {
  type: FieldTypes
  descriptionKey: string
}[] = [
  { type: FieldTypes.TEXT, descriptionKey: 'vectorSearch.fieldType.list.text' },
  { type: FieldTypes.TAG, descriptionKey: 'vectorSearch.fieldType.list.tag' },
  {
    type: FieldTypes.NUMERIC,
    descriptionKey: 'vectorSearch.fieldType.list.numeric',
  },
  { type: FieldTypes.GEO, descriptionKey: 'vectorSearch.fieldType.list.geo' },
  {
    type: FieldTypes.VECTOR,
    descriptionKey: 'vectorSearch.fieldType.list.vector',
  },
]

export const IndexingTypeContent = () => {
  const { t } = useTranslation()

  return (
    <Col gap="m" data-testid="create-index-onboarding-indexing-types">
      <Text size="m" color="secondary">
        {t('vectorSearch.fieldType.list.intro')}
      </Text>

      {FIELD_TYPE_DESCRIPTION_KEYS.map(({ type, descriptionKey }) => (
        <S.FieldTypeRow key={type} gap="s">
          <FieldTag tag={type} />
          <Text>{t(descriptionKey as never)}</Text>
        </S.FieldTypeRow>
      ))}

      <Text size="m" color="secondary">
        {t('vectorSearch.fieldType.list.optionalSettings')}
      </Text>
    </Col>
  )
}
