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
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { WindowEvent } from 'uiSrc/components/base/utils/WindowEvent'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { InfoIcon } from 'uiSrc/components/base/icons'
import {
  FormField,
  RiInfoIconProps,
} from 'uiSrc/components/base/forms/FormField'
import {
  NumericInput,
  PasswordInput,
  TextInput,
} from 'uiSrc/components/base/inputs'
import { RiTooltip } from 'uiSrc/components'
import { HostInfoTooltipContent } from '../../host-info-tooltip-content/HostInfoTooltipContent'

import { ScrollableWrapper } from '../../styles.module'

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
  // deepcode ignore NoHardcodedPasswords: <Not a password but "password" field placeholder>
  password: 'Admin Password',
}

const hostInfo: RiInfoIconProps = {
  content: HostInfoTooltipContent({ includeAutofillInfo: true }),
  placement: 'right',
  maxWidth: '100%',
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

  const CancelButton = ({ onClick }: { onClick: () => void }) => (
    <SecondaryButton className="btn-cancel" onClick={onClick}>
      Cancel
    </SecondaryButton>
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
      <PrimaryButton
        type="submit"
        onClick={onClick}
        disabled={submitIsDisabled}
        loading={loading}
        icon={submitIsDisabled ? InfoIcon : undefined}
        data-testid="btn-submit"
      >
        Submit
      </PrimaryButton>
    </RiTooltip>
  )

  const Footer = () => {
    const footerEl = document.getElementById('footerDatabaseForm')
    if (footerEl) {
      return ReactDOM.createPortal(
        <Row justify="end" gap="m">
          {onClose && <CancelButton onClick={onClose} />}
          <SubmitButton
            onClick={formik.submitForm}
            submitIsDisabled={!submitIsEnable()}
          />
        </Row>,
        footerEl,
      )
    }
    return null
  }

  return (
    <ScrollableWrapper data-testid="add-db_cluster">
      <MessageEnterpriceSoftware />
      <br />
      <form>
        <WindowEvent event="keydown" handler={onKeyDown} />

        <Col gap="l">
          <Row gap="m" responsive>
            <FlexItem grow={4}>
              <FormField label="Cluster Host" required infoIconProps={hostInfo}>
                <TextInput
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
              </FormField>
            </FlexItem>

            <FlexItem grow={2}>
              <FormField label="Cluster Port" required>
                <NumericInput
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
              </FormField>
            </FlexItem>
          </Row>

          <Row gap="m" responsive>
            <FlexItem grow>
              <FormField label="Admin Username" required>
                <TextInput
                  name="username"
                  id="username"
                  data-testid="username"
                  maxLength={200}
                  placeholder="Enter Admin Username"
                  value={formik.values.username}
                  onChange={(value) => formik.setFieldValue('username', value)}
                />
              </FormField>
            </FlexItem>

            <FlexItem grow>
              <FormField label="Admin Password" required>
                <PasswordInput
                  type="dual"
                  name="password"
                  id="password"
                  data-testid="password"
                  maxLength={200}
                  placeholder="Enter Password"
                  value={formik.values.password}
                  onChange={(value) => formik.setFieldValue('password', value)}
                  autoComplete="new-password"
                />
              </FormField>
            </FlexItem>
          </Row>
        </Col>
      </form>
      <Footer />
    </ScrollableWrapper>
  )
}

export default ClusterConnectionForm
