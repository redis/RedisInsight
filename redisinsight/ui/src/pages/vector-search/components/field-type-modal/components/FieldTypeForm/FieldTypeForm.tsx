import React from 'react'
import { FormikProps } from 'formik'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import { VectorFieldOptions } from '../VectorFieldOptions/VectorFieldOptions'
import { TextFieldOptions } from '../TextFieldOptions/TextFieldOptions'
import { FieldTypeFormValues } from './FieldTypeForm.types'

export interface FieldTypeFormProps {
  formik: FormikProps<FieldTypeFormValues>
}

const SECTION_LABELS: Partial<Record<FieldTypes, string>> = {
  [FieldTypes.VECTOR]: 'VECTOR options',
  [FieldTypes.TEXT]: 'TEXT options',
}

export const FieldTypeForm = ({ formik }: FieldTypeFormProps) => {
  const { fieldType } = formik.values
  const sectionLabel = SECTION_LABELS[fieldType]

  if (!sectionLabel) return null

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
