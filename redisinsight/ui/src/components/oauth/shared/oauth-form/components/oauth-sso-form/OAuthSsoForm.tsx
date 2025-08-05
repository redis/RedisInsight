import { isEmpty } from 'lodash'
import React, { useState } from 'react'
import { FormikErrors, useFormik } from 'formik'
import { validateEmail, validateField } from 'uiSrc/utils'

import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
} from 'uiSrc/components/base/forms'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { RiTextInput } from 'uiSrc/components/base/inputs'
import { Title } from 'uiSrc/components/base/text/Title'
import styles from './styles.module.scss'

export interface Props {
  onBack: () => void
  onSubmit: (values: { email: string }) => any
}

interface Values {
  email: string
}

const OAuthSsoForm = ({ onBack, onSubmit }: Props) => {
  const [validationErrors, setValidationErrors] = useState<
    FormikErrors<Values>
  >({ email: '' })

  const validate = (values: Values) => {
    const errs: FormikErrors<Values> = {}

    if (!values?.email || !validateEmail(values.email)) {
      errs.email = 'Invalid email'
    }

    setValidationErrors(errs)

    return errs
  }

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validate,
    onSubmit,
  })

  const submitIsDisabled = () => !isEmpty(validationErrors)

  const SubmitButton = ({
    text,
    disabled,
  }: {
    disabled: boolean
    text: string
  }) => (
    <RiTooltip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      data-testid="btn-submit-tooltip"
      content={
        disabled ? (
          <>
            <p>Email must be in the format</p>
            <p>email@example.com without spaces</p>
          </>
        ) : null
      }
    >
      <RiPrimaryButton
        size="s"
        type="submit"
        disabled={disabled}
        icon={disabled ? InfoIcon : undefined}
        data-testid="btn-submit"
      >
        {text}
      </RiPrimaryButton>
    </RiTooltip>
  )

  return (
    <div className={styles.container} data-testid="oauth-container-sso-form">
      <Title className={styles.title} size="S">
        Single Sign-On
      </Title>
      <form onSubmit={formik.handleSubmit}>
        <Row>
          <FlexItem>
            <RiFormField className={styles.formRaw} label="Email">
              <RiTextInput
                name="email"
                id="sso-email"
                data-testid="sso-email"
                maxLength={200}
                value={formik.values.email}
                autoComplete="off"
                onChange={(value) => {
                  formik.setFieldValue('email', validateField(value.trim()))
                }}
              />
            </RiFormField>
          </FlexItem>
        </Row>
        <Spacer />
        <Row justify="end">
          <FlexItem>
            <RiSecondaryButton
              type="button"
              size="s"
              onClick={onBack}
              data-testid="btn-back"
            >
              Back
            </RiSecondaryButton>
          </FlexItem>
          <FlexItem>
            <SubmitButton text="Login" disabled={submitIsDisabled()} />
          </FlexItem>
        </Row>
      </form>
    </div>
  )
}

export default OAuthSsoForm
