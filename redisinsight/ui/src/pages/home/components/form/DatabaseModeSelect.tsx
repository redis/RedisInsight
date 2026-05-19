import React from 'react'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { DatabaseModeValue } from 'uiSrc/slices/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import { Text } from 'uiSrc/components/base/text/Text'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const options: { value: DatabaseModeValue; label: string }[] = [
  { value: 'unmarked', label: 'Unmarked' },
  { value: 'production', label: 'Production' },
  { value: 'fast', label: 'Fast' },
]

const DatabaseModeLabel = () => (
  <Row align="center" gap="s">
    <Text>Database mode</Text>
    <RiTooltip
      position="right"
      content={
        <Text>
          Production adds confirmation friction before risky changes. Fast
          skips confirmations for trusted dev/test connections. Unmarked uses
          default behavior.
        </Text>
      }
    >
      <FlexItem>
        <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
      </FlexItem>
    </RiTooltip>
  </Row>
)

const DatabaseModeSelect = (props: Props) => {
  const { formik } = props

  return (
    <Row gap="m">
      <FlexItem grow>
        <FormField label={<DatabaseModeLabel />}>
          <RiSelect
            name="databaseMode"
            value={formik.values.databaseMode ?? 'unmarked'}
            options={options}
            onChange={(value) => {
              formik.setFieldValue('databaseMode', value)
            }}
            data-testid="select-database-mode"
          />
        </FormField>
      </FlexItem>
      <FlexItem grow />
    </Row>
  )
}

export default DatabaseModeSelect
