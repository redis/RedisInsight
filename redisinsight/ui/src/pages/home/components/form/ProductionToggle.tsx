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

const ProductionToggleLabel = () => (
  <Row align="center" gap="s">
    <Text>Production</Text>
    <RiTooltip
      position="right"
      content={
        <Text>
          When marked as production, Redis Insight adds an extra layer of
          protection to prevent unintended changes. This includes additional
          confirmation dialogs before modifying data and stronger friction
          before running dangerous commands.
        </Text>
      }
    >
      <FlexItem>
        <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
      </FlexItem>
    </RiTooltip>
  </Row>
)

const ProductionToggle = (props: Props) => {
  const { formik } = props

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    formik.handleChange(e)
  }
  const id = useGenerateId('', ' over isProduction')

  return (
    <Row gap="s">
      <FlexItem>
        <FormField>
          <Checkbox
            id={id}
            name="isProduction"
            label={<ProductionToggleLabel />}
            checked={!!formik.values.isProduction}
            onChange={handleChange}
            data-testid="isProduction"
          />
        </FormField>
      </FlexItem>
    </Row>
  )
}

export default ProductionToggle
