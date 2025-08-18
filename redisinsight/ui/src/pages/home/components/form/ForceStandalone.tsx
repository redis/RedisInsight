import React, { ChangeEvent } from 'react'
import { FormikProps } from 'formik'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiFormField, RiCheckbox } from 'uiBase/forms'
import { RiIcon } from 'uiBase/icons'
import { useGenerateId } from 'uiBase/utils'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { RiTooltip } from 'uiBase/display'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const ForceStandaloneLabel = () => (
  <>
    <span>Force Standalone Connection</span>
    <RiTooltip
      className="homePage_tooltip"
      position="right"
      content={
        <p>
          Override the default connection logic and connect to the specified
          endpoint as a standalone database.
        </p>
      }
    >
      <RiIcon
        type="InfoIcon"
        style={{
          cursor: 'pointer',
          marginLeft: '5px',
        }}
      />
    </RiTooltip>
  </>
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
    <RiRow gap="s">
      <RiFlexItem>
        <RiFormField>
          <RiCheckbox
            id={id}
            name="forceStandalone"
            label={<ForceStandaloneLabel />}
            checked={!!formik.values.forceStandalone}
            onChange={handleChangeForceStandaloneCheckbox}
            data-testid="forceStandalone"
          />
        </RiFormField>
      </RiFlexItem>
    </RiRow>
  )
}

export default ForceStandalone
