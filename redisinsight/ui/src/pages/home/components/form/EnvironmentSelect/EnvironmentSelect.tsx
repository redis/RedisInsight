import React from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'

import { ENVIRONMENT_OPTIONS } from './EnvironmentSelect.constants'
import { EnvironmentSelectProps } from './EnvironmentSelect.types'
import EnvironmentLabel from './components/EnvironmentLabel'

const EnvironmentSelect = ({ formik }: EnvironmentSelectProps) => (
  <Row gap="m">
    <FlexItem grow>
      <FormField label={<EnvironmentLabel />}>
        <RiSelect
          name="environment"
          value={formik.values.environment}
          options={ENVIRONMENT_OPTIONS}
          onChange={(value) => {
            formik.setFieldValue('environment', value)
          }}
          data-testid="select-environment"
        />
      </FormField>
    </FlexItem>
    <FlexItem grow />
  </Row>
)

export default EnvironmentSelect
