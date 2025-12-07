import React from 'react'
import { FormikErrors } from 'formik'
import validationErrors from 'uiSrc/constants/validationErrors'
import { getSubmitButtonContent } from 'uiSrc/pages/home/utils'
import { DbConnectionInfo, ISubmitButton } from 'uiSrc/pages/home/interfaces'
import { SubmitBtnText } from 'uiSrc/pages/home/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  EmptyButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
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
      <PrimaryButton
        type="submit"
        onClick={onClick}
        disabled={submitIsDisabled}
        loading={isLoading}
        icon={submitIsDisabled ? InfoIcon : undefined}
        data-testid="btn-submit"
      >
        {text}
      </PrimaryButton>
    </RiTooltip>
  )

  return (
    <Row justify="between" align="center">
      <FlexItem className="btn-back">
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
          <EmptyButton
            className="empty-btn"
            disabled={submitIsDisable()}
            icon={submitIsDisable() ? InfoIcon : undefined}
            onClick={onClickTestConnection}
            loading={isLoading}
            data-testid="btn-test-connection"
          >
            Test Connection
          </EmptyButton>
        </RiTooltip>
      </FlexItem>

      <FlexItem>
        <Row>
          {onClose && (
            <SecondaryButton
              onClick={onClose}
              className="btn-cancel"
              data-testid="btn-cancel"
              style={{ marginRight: 12 }}
            >
              Cancel
            </SecondaryButton>
          )}
          <SubmitButton
            onClick={onClickSubmit}
            text={submitButtonText}
            submitIsDisabled={submitIsDisable()}
          />
        </Row>
      </FlexItem>
    </Row>
  )
}

export default FooterActions
