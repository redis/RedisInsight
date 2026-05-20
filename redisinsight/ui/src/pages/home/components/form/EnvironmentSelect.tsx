import React from 'react'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { Environment } from 'apiClient'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import { Text } from 'uiSrc/components/base/text/Text'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const options: { value: Environment; label: string }[] = [
  { value: Environment.Unspecified, label: 'Unspecified' },
  { value: Environment.Production, label: 'Production' },
  { value: Environment.Development, label: 'Development' },
]

const EnvironmentTooltipContent = () => (
  <>
    <Text>Classify this database to apply the right safety behavior.</Text>
    <Text>
      <strong>Production</strong> — Adds an extra layer of protection to prevent
      unintended changes. Includes additional confirmation dialogs before
      modifying data and stronger friction before running dangerous commands.
    </Text>
    <Text>
      <strong>Development</strong> — Skips standard confirmation dialogs when
      modifying data, for faster work on development and test databases.
    </Text>
    <Text>
      <strong>Unspecified</strong> — Standard Redis Insight behavior. The
      default for new and existing connections.
    </Text>
  </>
)

const EnvironmentLabel = () => (
  <Row align="center" gap="s">
    <Text>Environment</Text>
    <RiTooltip position="right" content={<EnvironmentTooltipContent />}>
      <FlexItem>
        <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
      </FlexItem>
    </RiTooltip>
  </Row>
)

const EnvironmentSelect = (props: Props) => {
  const { formik } = props

  return (
    <Row gap="m">
      <FlexItem grow>
        <FormField label={<EnvironmentLabel />}>
          <RiSelect
            name="environment"
            value={formik.values.environment}
            options={options}
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
}

export default EnvironmentSelect
