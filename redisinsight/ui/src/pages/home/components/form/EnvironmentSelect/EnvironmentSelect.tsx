import React, { useMemo } from 'react'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { useTranslation } from 'uiSrc/i18n'

import { ENVIRONMENT_OPTIONS } from './EnvironmentSelect.constants'
import { EnvironmentSelectProps } from './EnvironmentSelect.types'
import { useEnvironmentPromotion } from './hooks/useEnvironmentPromotion'
import EnvironmentLabel from './components/EnvironmentLabel'

const EnvironmentSelect = ({ formik }: EnvironmentSelectProps) => {
  const { t } = useTranslation()
  const { wrapperRef, isDropdownOpen, onDropdownOpenChange } =
    useEnvironmentPromotion()

  const options = useMemo(
    () =>
      ENVIRONMENT_OPTIONS.map((option) => ({
        ...option,
        label: t(option.label),
      })),
    [t],
  )

  return (
    <div ref={wrapperRef}>
      <Row gap="m">
        <FlexItem grow>
          <FormField label={<EnvironmentLabel />}>
            <RiSelect
              name="environment"
              value={formik.values.environment}
              options={options}
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
