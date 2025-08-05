import React from 'react'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiFormField } from 'uiSrc/components/base/forms'
import { TextInput } from 'uiSrc/components/base/inputs'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
}

const PrimaryGroupSentinel = (props: Props) => {
  const { flexGroupClassName = '', flexItemClassName = '', formik } = props
  return (
    <>
      <Row gap="m" responsive className={flexGroupClassName}>
        <FlexItem grow className={flexItemClassName}>
          <RiFormField label="Database Alias*">
            <TextInput
              name="name"
              id="name"
              data-testid="name"
              placeholder="Enter Database Alias"
              value={formik.values.name ?? ''}
              maxLength={500}
              onChange={formik.handleChange}
            />
          </RiFormField>
        </FlexItem>
      </Row>
      <Row gap="m" responsive className={flexGroupClassName}>
        <FlexItem grow className={flexItemClassName}>
          <RiFormField label="Primary Group Name*">
            <TextInput
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
        </FlexItem>
      </Row>
    </>
  )
}

export default PrimaryGroupSentinel
