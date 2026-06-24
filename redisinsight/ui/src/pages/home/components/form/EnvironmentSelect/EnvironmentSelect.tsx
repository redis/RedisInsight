import React from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'

import { ENVIRONMENT_OPTIONS } from './EnvironmentSelect.constants'
import { EnvironmentSelectProps } from './EnvironmentSelect.types'
import { useEnvironmentPromotion } from './hooks/useEnvironmentPromotion'
import EnvironmentLabel from './components/EnvironmentLabel'

const EnvironmentSelect = ({ formik }: EnvironmentSelectProps) => {
  const { wrapperRef, isDropdownOpen, onDropdownOpenChange } =
    useEnvironmentPromotion()

  return (
    <div ref={wrapperRef}>
      <Row gap="m">
        <FlexItem grow>
          <FormField label={<EnvironmentLabel />}>
            <RiSelect
              name="environment"
              value={formik.values.environment}
              options={ENVIRONMENT_OPTIONS}
              open={isDropdownOpen}
              onOpenChange={onDropdownOpenChange}
              onChange={(value) => {
                formik.setFieldValue('environment', value)
              }}
              data-testid="select-environment"
            />
          </FormField>
        </FlexItem>
        <FlexItem grow />
      </Row>
    </div>
  )
}

export default EnvironmentSelect
