import React from 'react'
import { FormikProps } from 'formik'

import { KeyValueFormat } from 'uiSrc/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiFormField, RiSelect } from 'uiSrc/components/base/forms'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const KeyFormatSelector = (props: Props) => {
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
    <RiRow gap="m">
      <RiFlexItem grow>
        <RiFormField label="Key name format">
          <RiSelect
            name="key-name-format"
            placeholder="Key name format"
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
        </RiFormField>
      </RiFlexItem>
      <RiFlexItem grow />
    </RiRow>
  )
}

export default KeyFormatSelector
