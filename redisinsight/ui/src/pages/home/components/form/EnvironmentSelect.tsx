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

const EnvironmentLabel = () => (
  <Row align="center" gap="s">
    <Text>Environment</Text>
    <RiTooltip
      position="right"
      content={
        <Text>
          Classify this database to apply the right safety behavior. When marked
          as production, Redis Insight adds an extra layer of protection to
          prevent unintended changes. This includes additional confirmation
          dialogues before modifying data and stronger friction before running
          dangerous commands.
        </Text>
      }
    >
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
