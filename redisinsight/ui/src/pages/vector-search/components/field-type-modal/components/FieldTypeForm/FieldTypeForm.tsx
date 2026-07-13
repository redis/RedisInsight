import React from 'react'
import { FormikProps } from 'formik'
import { useTranslation } from 'uiSrc/i18n'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import { VectorFieldOptions } from '../VectorFieldOptions/VectorFieldOptions'
import { TextFieldOptions } from '../TextFieldOptions/TextFieldOptions'
import { FieldTypeFormValues } from './FieldTypeForm.types'

export interface FieldTypeFormProps {
  formik: FormikProps<FieldTypeFormValues>
}

const SECTION_LABEL_TOKENS: Partial<Record<FieldTypes, string>> = {
  [FieldTypes.VECTOR]: 'VECTOR',
  [FieldTypes.TEXT]: 'TEXT',
}

export const FieldTypeForm = ({ formik }: FieldTypeFormProps) => {
  const { t } = useTranslation()
  const { fieldType } = formik.values
  const sectionToken = SECTION_LABEL_TOKENS[fieldType]

  if (!sectionToken) return null

  const sectionLabel = t('vectorSearch.fieldType.sectionOptions', {
    type: sectionToken,
  })

  return (
    <Col gap="l">
      <Text color="primary" data-testid="field-type-modal-section-header">
        {sectionLabel}
      </Text>
      {fieldType === FieldTypes.VECTOR && (
        <VectorFieldOptions formik={formik} />
      )}
      {fieldType === FieldTypes.TEXT && <TextFieldOptions formik={formik} />}
    </Col>
  )
}
