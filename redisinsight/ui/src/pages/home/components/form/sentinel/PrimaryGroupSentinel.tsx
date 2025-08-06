import React from 'react'
import { FormikProps } from 'formik'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiFormField } from 'uiBase/forms'
import { RiTextInput } from 'uiBase/inputs'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
}

const PrimaryGroupSentinel = (props: Props) => {
  const { flexGroupClassName = '', flexItemClassName = '', formik } = props
  return (
    <>
      <RiRow gap="m" responsive className={flexGroupClassName}>
        <RiFlexItem grow className={flexItemClassName}>
          <RiFormField label="Database Alias*">
            <RiTextInput
              name="name"
              id="name"
              data-testid="name"
              placeholder="Enter Database Alias"
              value={formik.values.name ?? ''}
              maxLength={500}
              onChange={formik.handleChange}
            />
          </RiFormField>
        </RiFlexItem>
      </RiRow>
      <RiRow gap="m" responsive className={flexGroupClassName}>
        <RiFlexItem grow className={flexItemClassName}>
          <RiFormField label="Primary Group Name*">
            <RiTextInput
              name="sentinelMasterName"
              id="sentinelMasterName"
              data-testid="primary-group"
              placeholder="Enter Primary Group Name"
              value={formik.values.sentinelMasterName ?? ''}
              maxLength={500}
              onChange={formik.handleChange}
              disabled
            />
          </RiFormField>
        </RiFlexItem>
      </RiRow>
    </>
  )
}

export default PrimaryGroupSentinel
