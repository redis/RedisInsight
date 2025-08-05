import { FormikErrors, useFormik } from 'formik'
import { isEmpty, pick } from 'lodash'
import React, { useRef, useState } from 'react'
import ReactDOM from 'react-dom'

import * as keys from 'uiSrc/constants/keys'
import validationErrors from 'uiSrc/constants/validationErrors'
import { fieldDisplayNames } from 'uiSrc/pages/home/constants'
import { getFormErrors, getSubmitButtonContent } from 'uiSrc/pages/home/utils'
import { DbConnectionInfo, ISubmitButton } from 'uiSrc/pages/home/interfaces'
import {
  DatabaseForm,
  MessageSentinel,
  TlsDetails,
} from 'uiSrc/pages/home/components/form'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { RiPrimaryButton, RiSecondaryButton } from 'uiSrc/components/base/forms'
import { RiTooltip } from 'uiSrc/components'

export interface Props {
  loading: boolean
  initialValues: DbConnectionInfo
  certificates: { id: string; name: string }[]
  caCertificates: { id: string; name: string }[]
  onSubmit: (values: DbConnectionInfo) => void
  onHostNamePaste: (content: string) => boolean
  onClose?: () => void
}

const getInitFieldsDisplayNames = ({ host, port }: any) => {
  if (!host || !port) {
    return pick(fieldDisplayNames, ['host', 'port'])
  }
  return {}
}

const SentinelConnectionForm = (props: Props) => {
  const {
    initialValues = {},
    onClose,
    onSubmit,
    onHostNamePaste,
    loading,
    certificates,
    caCertificates,
  } = props

  const [errors, setErrors] = useState<FormikErrors<DbConnectionInfo>>(
    getInitFieldsDisplayNames(initialValues),
  )

  const formRef = useRef<HTMLDivElement>(null)

  const submitIsDisable = () => !isEmpty(errors)

  const validate = (values: DbConnectionInfo) => {
    const errs = getFormErrors(values)
    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: (values: any) => {
      onSubmit(values)
    },
  })

  const onKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === keys.ENTER && !submitIsDisable()) {
      // event.
      formik.submitForm()
    }
  }

  const SubmitButton = ({ onClick, submitIsDisabled }: ISubmitButton) => (
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
        size="s"
        type="submit"
        onClick={onClick}
        disabled={submitIsDisabled}
        loading={loading}
        icon={submitIsDisabled ? InfoIcon : undefined}
        data-testid="btn-submit"
        style={{ marginLeft: 12 }}
      >
        Discover Database
      </RiPrimaryButton>
    </RiTooltip>
  )

  const Footer = () => {
    const footerEl = document.getElementById('footerDatabaseForm')

    if (footerEl) {
      return ReactDOM.createPortal(
        <div className="footerAddDatabase">
          {onClose && (
            <RiSecondaryButton
              size="s"
              onClick={onClose}
              className="btn-cancel"
              data-testid="btn-cancel"
            >
              Cancel
            </RiSecondaryButton>
          )}
          <SubmitButton
            onClick={formik.submitForm}
            submitIsDisabled={submitIsDisable()}
          />
        </div>,
        footerEl,
      )
    }
    return null
  }

  return (
    <div
      className="relative"
      data-testid="add-db_sentinel"
      style={{ height: '100%' }}
    >
      <div className="getStartedForm eui-yScroll" ref={formRef}>
        <MessageSentinel />
        <br />
        <form
          onSubmit={formik.handleSubmit}
          data-testid="form"
          onKeyDown={onKeyDown}
          role="presentation"
        >
          <DatabaseForm
            formik={formik}
            showFields={{
              host: true,
              port: true,
              alias: false,
              timeout: false,
            }}
            onHostNamePaste={onHostNamePaste}
          />
          <Spacer />
          <TlsDetails
            formik={formik}
            certificates={certificates}
            caCertificates={caCertificates}
          />
        </form>
      </div>
      <Footer />
    </div>
  )
}

export default SentinelConnectionForm
