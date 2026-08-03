import React from 'react'
import { FormikProps } from 'formik'

import { KeyValueFormat } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { useTranslation } from 'uiSrc/i18n'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const KeyFormatSelector = (props: Props) => {
  const { t } = useTranslation()
  const { formik } = props

  const options = [
    {
      value: KeyValueFormat.Unicode,
      label: 'Unicode',
    },
    {
      value: KeyValueFormat.HEX,
      label: 'HEX',
    },
  ]

  return (
    <Row gap="m">
      <FlexItem grow>
        <FormField label={t('home.form.keyFormat.label')}>
          <RiSelect
            name="key-name-format"
            placeholder={t('home.form.keyFormat.label')}
            // TODO: fix the type
            value={
              (formik.values.keyNameFormat as unknown as string) ||
              KeyValueFormat.Unicode
            }
            options={options}
            onChange={(value) => {
              formik.setFieldValue('keyNameFormat', value)
            }}
            data-testid="select-key-name-format"
          />
        </FormField>
      </FlexItem>
      <FlexItem grow />
    </Row>
  )
}

export default KeyFormatSelector
