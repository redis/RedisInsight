import React from 'react'
import { FormikProps } from 'formik'
import { useTranslation } from 'uiSrc/i18n'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import NumericInput from 'uiSrc/components/base/inputs/NumericInput'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'

import {
  PHONETIC_NONE,
  getPhoneticOptions,
} from '../../FieldTypeModal.constants'
import { FieldTypeFormValues } from '../FieldTypeForm/FieldTypeForm.types'

export interface TextFieldOptionsProps {
  formik: FormikProps<FieldTypeFormValues>
}

export const TextFieldOptions = ({ formik }: TextFieldOptionsProps) => {
  const { t } = useTranslation()
  const { values, errors, setFieldValue } = formik
  const phoneticOptions = getPhoneticOptions()

  return (
    <Row gap="l">
      <FlexItem grow>
        <FormField
          label={t('vectorSearch.fieldType.text.weight')}
          infoIconProps={{
            content: t('vectorSearch.fieldType.text.weightTooltip'),
          }}
        >
          <NumericInput
            value={values.weight ?? null}
            onChange={(val: number | null) =>
              setFieldValue('weight', val ?? undefined)
            }
            error={errors.weight}
            min={0}
            step={0.1}
            data-testid="field-type-modal-text-weight"
          />
        </FormField>
      </FlexItem>
      <FlexItem grow>
        <FormField
          label={t('vectorSearch.fieldType.text.phoneticMatcher')}
          infoIconProps={{
            content: t('vectorSearch.fieldType.text.phoneticMatcherTooltip'),
          }}
        >
          <RiSelect
            options={phoneticOptions}
            value={values.phonetic ?? PHONETIC_NONE}
            onChange={(val: string) =>
              setFieldValue('phonetic', val === PHONETIC_NONE ? undefined : val)
            }
            data-testid="field-type-modal-text-phonetic"
          />
        </FormField>
      </FlexItem>
    </Row>
  )
}
