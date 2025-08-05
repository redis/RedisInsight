import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { FormikErrors, useFormik } from 'formik'
import { isEmpty } from 'lodash'
import { useSelector } from 'react-redux'

import * as keys from 'uiSrc/constants/keys'
import { validateField } from 'uiSrc/utils/validations'
import validationErrors from 'uiSrc/constants/validationErrors'
import { FeatureFlagComponent, RiTooltip } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import { CloudConnectionOptions } from 'uiSrc/pages/home/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { OAuthAutodiscovery } from 'uiSrc/components/oauth/oauth-sso'
import { MessageCloudApiKeys } from 'uiSrc/pages/home/components/form/Messages'
import { RiCol, RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiWindowEvent } from 'uiSrc/components/base/utils'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { InfoIcon } from 'uiSrc/components/base/icons'
import {
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
  RiRadioGroup,
} from 'uiSrc/components/base/forms'
import { RiText } from 'uiSrc/components/base/text'
import { RiTextInput } from 'uiSrc/components/base/inputs'
import { ICloudConnectionSubmit } from '../CloudConnectionFormWrapper'

import styles from '../styles.module.scss'

export interface Props {
  accessKey: string
  secretKey: string
  onClose?: () => void
  onSubmit: ({ accessKey, secretKey }: ICloudConnectionSubmit) => void
  loading: boolean
}

interface ISubmitButton {
  onClick: () => void
  submitIsDisabled: boolean
}

interface Values {
  accessKey: string
  secretKey: string
}

const fieldDisplayNames: Values = {
  accessKey: 'Enter API Account Key',
  secretKey: 'Enter API User Key',
}

const options = [
  {
    id: CloudConnectionOptions.Account,
    value: CloudConnectionOptions.Account,
    label: 'Redis Cloud account',
  },
  {
    id: CloudConnectionOptions.ApiKeys,
    value: CloudConnectionOptions.ApiKeys,
    label: 'Redis Cloud API keys',
  },
]

const CloudConnectionForm = (props: Props) => {
  const { accessKey, secretKey, onClose, onSubmit, loading } = props

  const { [FeatureFlags.cloudSso]: cloudSsoFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const [domReady, setDomReady] = useState(false)
  const [errors, setErrors] = useState<FormikErrors<Values>>(
    accessKey || secretKey ? {} : fieldDisplayNames,
  )
  const [type, setType] = useState<CloudConnectionOptions>(
    cloudSsoFeature?.flag
      ? CloudConnectionOptions.Account
      : CloudConnectionOptions.ApiKeys,
  )

  useEffect(() => {
    setDomReady(true)
  }, [])

  const validate = (values: Values) => {
    const errs: FormikErrors<Values> = {}

    Object.entries(values).forEach(
      ([key, value]) =>
        !value && Object.assign(errs, { [key]: fieldDisplayNames[key] }),
    )

    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues: {
      accessKey,
      secretKey,
    },
    validate,
    onSubmit: (values) => {
      onSubmit(values)
    },
  })

  const submitIsEnable = () => isEmpty(errors)

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === keys.ENTER && submitIsEnable()) {
      formik.submitForm()
      event.stopPropagation()
    }
  }

  const CancelButton = ({ onClick }: { onClick: () => void }) => (
    <RiSecondaryButton
      size="s"
      className="btn-cancel"
      onClick={onClick}
      style={{ marginRight: 12 }}
    >
      Cancel
    </RiSecondaryButton>
  )

  const SubmitButton = ({ onClick, submitIsDisabled }: ISubmitButton) => (
    <RiTooltip
      position="top"
      anchorClassName="euiToolTip__btn-disabled"
      title={
        submitIsDisabled
          ? validationErrors.REQUIRED_TITLE(Object.values(errors).length)
          : null
      }
      content={
        submitIsDisabled ? (
          <span>
            {Object.values(errors).map((err) => [err, <br key={err} />])}
          </span>
        ) : null
      }
    >
      <RiPrimaryButton
        size="s"
        type="submit"
        onClick={onClick}
        disabled={submitIsDisabled}
        loading={loading}
        icon={submitIsDisabled ? InfoIcon : undefined}
        data-testid="btn-submit"
      >
        Submit
      </RiPrimaryButton>
    </RiTooltip>
  )

  const Footer = () => {
    if (!domReady) return null

    const footerEl = document.getElementById('footerDatabaseForm')
    if (footerEl) {
      return ReactDOM.createPortal(
        <div className="footerAddDatabase">
          {onClose && <CancelButton onClick={onClose} />}
          <SubmitButton
            onClick={formik.submitForm}
            submitIsDisabled={!submitIsEnable()}
          />
        </div>,
        footerEl,
      )
    }
    return null
  }

  const CloudApiForm = (
    <div className={styles.cloudApi} data-testid="add-db_cloud-api">
      <MessageCloudApiKeys />
      <RiSpacer />
      <RiWindowEvent event="keydown" handler={onKeyDown} />
      <form onSubmit={formik.handleSubmit}>
        <RiRow responsive>
          <RiFlexItem>
            <RiFormField label="API Account Key*">
              <RiTextInput
                name="accessKey"
                id="accessKey"
                data-testid="access-key"
                maxLength={200}
                placeholder={fieldDisplayNames.accessKey}
                value={formik.values.accessKey}
                autoComplete="off"
                onChange={(value) => {
                  formik.setFieldValue('accessKey', validateField(value.trim()))
                }}
              />
            </RiFormField>
          </RiFlexItem>
        </RiRow>
        <RiRow responsive>
          <RiFlexItem grow>
            <RiFormField label="API User Key*">
              <RiTextInput
                name="secretKey"
                id="secretKey"
                data-testid="secret-key"
                maxLength={200}
                placeholder={fieldDisplayNames.secretKey}
                value={formik.values.secretKey}
                autoComplete="off"
                onChange={(value) => {
                  formik.setFieldValue('secretKey', validateField(value.trim()))
                }}
              />
            </RiFormField>
          </RiFlexItem>
        </RiRow>
        <Footer />
      </form>
    </div>
  )

  return (
    <div className="getStartedForm eui-yScroll">
      <FeatureFlagComponent name={FeatureFlags.cloudSso}>
        <RiCol gap="m">
          <RiFlexItem grow>
            <RiText color="subdued" size="s">
              Connect with:
            </RiText>
          </RiFlexItem>
          <RiFlexItem grow>
            <RiRadioGroup
              layout="horizontal"
              items={options}
              value={type}
              onChange={(id) => setType(id as CloudConnectionOptions)}
              data-testid="cloud-options"
            />
          </RiFlexItem>
        </RiCol>
        <RiSpacer size="m" />
      </FeatureFlagComponent>
      {type === CloudConnectionOptions.Account && (
        <OAuthAutodiscovery
          source={OAuthSocialSource.DiscoveryForm}
          onClose={onClose}
        />
      )}
      {type === CloudConnectionOptions.ApiKeys && CloudApiForm}
    </div>
  )
}

export default CloudConnectionForm
