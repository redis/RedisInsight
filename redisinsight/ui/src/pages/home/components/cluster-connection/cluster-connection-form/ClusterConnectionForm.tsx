import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { isEmpty } from 'lodash'
import { FormikErrors, useFormik } from 'formik'

import * as keys from 'uiSrc/constants/keys'
import { MAX_PORT_NUMBER, validateField } from 'uiSrc/utils/validations'
import { handlePasteHostName } from 'uiSrc/utils'
import validationErrors from 'uiSrc/constants/validationErrors'
import { ICredentialsRedisCluster } from 'uiSrc/slices/interfaces'

import { MessageEnterpriceSoftware } from 'uiSrc/pages/home/components/form/Messages'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiWindowEvent } from 'uiSrc/components/base/utils/RiWindowEvent'
import {
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
} from 'uiSrc/components/base/forms'
import { InfoIcon, RiIcon } from 'uiSrc/components/base/icons'
import {
  RiNumericInput,
  RiPasswordInput,
  RiTextInput,
} from 'uiSrc/components/base/inputs'
import { RiTooltip } from 'uiSrc/components'

export interface Props {
  host: string
  port: string
  username: string
  password: string
  onHostNamePaste: (text: string) => boolean
  onClose?: () => void
  initialValues: Values
  onSubmit: (values: ICredentialsRedisCluster) => void
  loading: boolean
}

interface ISubmitButton {
  onClick: () => void
  submitIsDisabled: boolean
}

interface Values {
  host: string
  port: string
  username: string
  password: string
}

const fieldDisplayNames: Values = {
  host: 'Cluster Host',
  port: 'Cluster Port',
  username: 'Admin Username',
  // deepcode ignore NoHardcodedPasswords: <Not a passowrd but "password" field placeholder>
  password: 'Admin Password',
}

const ClusterConnectionForm = (props: Props) => {
  const {
    host,
    port,
    username,
    password,
    initialValues: initialValuesProp,
    onHostNamePaste,
    onClose,
    onSubmit,
    loading,
  } = props

  const [errors, setErrors] = useState<FormikErrors<Values>>(
    host || port || username || password ? {} : fieldDisplayNames,
  )

  const [initialValues, setInitialValues] = useState({
    host,
    port: port?.toString(),
    username,
    password,
  })

  useEffect(() => {
    const values = {
      ...initialValues,
      ...initialValuesProp,
    }

    setInitialValues(values)
    formik.validateForm(values)
  }, [initialValuesProp])

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
    initialValues,
    validate,
    enableReinitialize: true,
    validateOnMount: true,
    validateOnBlur: false,
    onSubmit: (values) => {
      onSubmit({ ...values, port: parseInt(values.port) })
    },
  })

  const submitIsEnable = () => isEmpty(errors)

  const onKeyDown = (event: any) => {
    if (event.key === keys.ENTER && submitIsEnable()) {
      formik.submitForm()
      event.stopPropagation()
    }
  }

  const AppendHostName = () => (
    <RiTooltip
      title={
        <div>
          <p>
            <b>Pasting a connection URL auto fills the database details.</b>
          </p>
          <p style={{ margin: 0, paddingTop: '10px' }}>
            The following connection URLs are supported:
          </p>
        </div>
      }
      className="homePage_tooltip"
      anchorClassName="inputAppendIcon"
      position="right"
      content={
        <ul className="homePage_toolTipUl">
          <li>
            <span className="dot" />
            redis://[[username]:[password]]@host:port
          </li>
          <li>
            <span className="dot" />
            rediss://[[username]:[password]]@host:port
          </li>
          <li>
            <span className="dot" />
            host:port
          </li>
        </ul>
      }
    >
      <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
    </RiTooltip>
  )

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

  return (
    <div className="getStartedForm eui-yScroll" data-testid="add-db_cluster">
      <MessageEnterpriceSoftware />
      <br />

      <form>
        <RiWindowEvent event="keydown" handler={onKeyDown} />
        <RiRow responsive>
          <RiFlexItem grow={4}>
            <RiFormField
              label="Cluster Host*"
              additionalText={<AppendHostName />}
            >
              <RiTextInput
                name="host"
                id="host"
                data-testid="host"
                maxLength={200}
                placeholder="Enter Cluster Host"
                value={formik.values.host}
                onChange={(value) => {
                  formik.setFieldValue('host', validateField(value.trim()))
                }}
                onPaste={(event: React.ClipboardEvent<HTMLInputElement>) =>
                  handlePasteHostName(onHostNamePaste, event)
                }
              />
            </RiFormField>
          </RiFlexItem>

          <RiFlexItem grow={2}>
            <RiFormField
              label="Cluster Port*"
              additionalText="Should not exceed 65535."
            >
              <RiNumericInput
                autoValidate
                min={0}
                max={MAX_PORT_NUMBER}
                name="port"
                id="port"
                data-testid="port"
                placeholder="Enter Cluster Port"
                value={Number(formik.values.port)}
                onChange={(value) => formik.setFieldValue('port', value)}
              />
            </RiFormField>
          </RiFlexItem>
        </RiRow>

        <RiRow responsive>
          <RiFlexItem grow>
            <RiFormField label="Admin Username*">
              <RiTextInput
                name="username"
                id="username"
                data-testid="username"
                maxLength={200}
                placeholder="Enter Admin Username"
                value={formik.values.username}
                onChange={formik.handleChange}
              />
            </RiFormField>
          </RiFlexItem>

          <RiFlexItem grow>
            <RiFormField label="Admin Password*">
              <RiPasswordInput
                type="dual"
                name="password"
                id="password"
                data-testid="password"
                maxLength={200}
                placeholder="Enter Password"
                value={formik.values.password}
                onChange={formik.handleChange}
                autoComplete="new-password"
              />
            </RiFormField>
          </RiFlexItem>
        </RiRow>
      </form>
      <Footer />
    </div>
  )
}

export default ClusterConnectionForm
