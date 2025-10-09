import React from 'react'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
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
          <FormField label="Database Alias*">
            <TextInput
              name="name"
              id="name"
              data-testid="name"
              placeholder="Enter Database Alias"
              value={formik.values.name ?? ''}
              maxLength={500}
              onChange={formik.handleChange}
            />
          </FormField>
        </FlexItem>
      </Row>
      <Row gap="m" responsive className={flexGroupClassName}>
        <FlexItem grow className={flexItemClassName}>
          <FormField label="Primary Group Name*">
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
          </FormField>
        </FlexItem>
      </Row>
    </>
  )
}

export default PrimaryGroupSentinel
