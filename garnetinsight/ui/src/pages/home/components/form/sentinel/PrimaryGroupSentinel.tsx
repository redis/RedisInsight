import React from 'react'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextInput } from 'uiSrc/components/base/inputs'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const PrimaryGroupSentinel = (props: Props) => {
  const { formik } = props
  return (
    <Col gap="l">
      <Row gap="m" responsive>
        <FlexItem grow>
          <FormField label="Database alias" required>
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
      <Row gap="m" responsive>
        <FlexItem grow>
          <FormField label="Primary group name" required>
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
    </Col>
  )
}

export default PrimaryGroupSentinel
