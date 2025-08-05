import React from 'react'
import { FormikErrors } from 'formik'
import validationErrors from 'uiSrc/constants/validationErrors'
import { getSubmitButtonContent } from 'uiSrc/pages/home/utils'
import { DbConnectionInfo, ISubmitButton } from 'uiSrc/pages/home/interfaces'
import { SubmitBtnText } from 'uiSrc/pages/home/constants'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import {
  RiEmptyButton,
  RiPrimaryButton,
  RiSecondaryButton,
} from 'uiSrc/components/base/forms'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'

export interface Props {
  submitIsDisable: () => boolean
  errors: FormikErrors<DbConnectionInfo>
  isLoading?: boolean
  onClickTestConnection: () => void
  onClose?: () => void
  onClickSubmit: () => void
  submitButtonText?: SubmitBtnText
}

const FooterActions = (props: Props) => {
  const {
    isLoading,
    submitButtonText,
    submitIsDisable,
    errors,
    onClickTestConnection,
    onClose,
    onClickSubmit,
  } = props

  const SubmitButton = ({
    text = '',
    onClick,
    submitIsDisabled,
  }: ISubmitButton) => (
    <RiTooltip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={
        submitIsDisabled
          ? validationErrors.REQUIRED_TITLE(Object.keys(errors).length)
          : null
      }
      content={getSubmitButtonContent(errors, submitIsDisabled)}
    >
      <RiPrimaryButton
        size="small"
        type="submit"
        onClick={onClick}
        disabled={submitIsDisabled}
        loading={isLoading}
        icon={submitIsDisabled ? InfoIcon : undefined}
        data-testid="btn-submit"
      >
        {text}
      </RiPrimaryButton>
    </RiTooltip>
  )

  return (
    <RiRow justify="between" align="center">
      <RiFlexItem className="btn-back">
        <RiTooltip
          position="top"
          anchorClassName="euiToolTip__btn-disabled"
          title={
            submitIsDisable()
              ? validationErrors.REQUIRED_TITLE(Object.keys(errors).length)
              : null
          }
          content={getSubmitButtonContent(errors, submitIsDisable())}
        >
          <RiEmptyButton
            size="small"
            className="empty-btn"
            disabled={submitIsDisable()}
            icon={submitIsDisable() ? InfoIcon : undefined}
            onClick={onClickTestConnection}
            loading={isLoading}
            data-testid="btn-test-connection"
          >
            Test Connection
          </RiEmptyButton>
        </RiTooltip>
      </RiFlexItem>

      <RiFlexItem>
        <RiRow>
          {onClose && (
            <RiSecondaryButton
              size="small"
              onClick={onClose}
              className="btn-cancel"
              data-testid="btn-cancel"
              style={{ marginRight: 12 }}
            >
              Cancel
            </RiSecondaryButton>
          )}
          <SubmitButton
            onClick={onClickSubmit}
            text={submitButtonText}
            submitIsDisabled={submitIsDisable()}
          />
        </RiRow>
      </RiFlexItem>
    </RiRow>
  )
}

export default FooterActions
