import React, { ChangeEvent } from 'react'
import { FormikProps } from 'formik'

import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import { useGenerateId } from 'uiSrc/components/base/utils/hooks/generate-id'
import { Text } from 'uiSrc/components/base/text/Text'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const ForceStandaloneLabel = () => (
  <Row align="center" gap="s">
    <Text>Force Standalone Connection</Text>
    <RiTooltip
      position="right"
      content={
        <Text>
          Override the default connection logic and connect to the specified
          endpoint as a standalone database.
        </Text>
      }
    >
      <FlexItem>
        <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
      </FlexItem>
    </RiTooltip>
  </Row>
)
const ForceStandalone = (props: Props) => {
  const { formik } = props

  const handleChangeForceStandaloneCheckbox = (
    e: ChangeEvent<HTMLInputElement>,
  ): void => {
    formik.handleChange(e)
  }
  const id = useGenerateId('', ' over forceStandalone')

  return (
    <Row gap="s">
      <FlexItem>
        <FormField>
          <Checkbox
            id={id}
            name="forceStandalone"
            label={<ForceStandaloneLabel />}
            checked={!!formik.values.forceStandalone}
            onChange={handleChangeForceStandaloneCheckbox}
            data-testid="forceStandalone"
          />
        </FormField>
      </FlexItem>
    </Row>
  )
}

export default ForceStandalone
