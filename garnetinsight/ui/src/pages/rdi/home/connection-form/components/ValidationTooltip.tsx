import { FormikErrors } from 'formik'
import React from 'react'

import validationErrors from 'uiSrc/constants/validationErrors'
import { RiTooltip } from 'uiSrc/components'
import { ConnectionFormValues } from '../ConnectionForm'

export interface Props {
  isValid: boolean
  errors: FormikErrors<ConnectionFormValues>
  children: React.ReactElement
}

const ValidationTooltip = ({ isValid, errors, children }: Props) => {
  const tooltipContent = (
    <ul data-testid="validation-errors-list">
      {Object.values(errors).map((value) => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  )

  return (
    <RiTooltip
      data-testid="connection-form-validation-tooltip"
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={
        !isValid
          ? validationErrors.REQUIRED_TITLE(Object.keys(errors).length)
          : null
      }
      content={!isValid ? tooltipContent : null}
    >
      {children}
    </RiTooltip>
  )
}

export default ValidationTooltip
