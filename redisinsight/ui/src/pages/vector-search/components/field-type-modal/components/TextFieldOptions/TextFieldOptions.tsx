import React from 'react'
import { FormikProps } from 'formik'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import NumericInput from 'uiSrc/components/base/inputs/NumericInput'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'

import { PHONETIC_NONE, PHONETIC_OPTIONS } from '../../FieldTypeModal.constants'
import { FieldTypeFormValues } from '../FieldTypeForm/FieldTypeForm.types'

export interface TextFieldOptionsProps {
  formik: FormikProps<FieldTypeFormValues>
}

export const TextFieldOptions = ({ formik }: TextFieldOptionsProps) => {
  const { values, errors, setFieldValue } = formik

  return (
    <Row gap="l">
      <FlexItem grow>
        <FormField
          label="Weight"
          infoIconProps={{
            content:
              'Declares the importance of this attribute when calculating result accuracy.',
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
          label="Phonetic matcher"
          infoIconProps={{
            content: 'Performs phonetic matching in searches.',
          }}
        >
          <RiSelect
            options={PHONETIC_OPTIONS}
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
