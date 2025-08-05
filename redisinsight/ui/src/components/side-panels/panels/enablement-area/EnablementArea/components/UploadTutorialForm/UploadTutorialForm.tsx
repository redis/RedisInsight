import React, { useState } from 'react'
import { useFormik } from 'formik'
import { FormikErrors } from 'formik/dist/types'
import { isEmpty } from 'lodash'

import { RiTextInput } from 'uiSrc/components/base/inputs'
import { Nullable } from 'uiSrc/utils'
import validationErrors from 'uiSrc/constants/validationErrors'
import { RiFilePicker, RiTooltip } from 'uiSrc/components'

import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton, RiSecondaryButton } from 'uiSrc/components/base/forms'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { RiText } from 'uiSrc/components/base/text'
import CreateTutorialLink from '../CreateTutorialLink'
import styles from './styles.module.scss'

export interface FormValues {
  file: Nullable<File>
  link: string
}

export interface Props {
  onSubmit: (data: FormValues) => void
  onCancel?: () => void
}

const UploadTutorialForm = (props: Props) => {
  const { onSubmit, onCancel } = props
  const [errors, setErrors] = useState<FormikErrors<FormValues>>({})

  const initialValues: FormValues = {
    file: null,
    link: '',
  }

  const isSubmitDisabled = !isEmpty(errors)

  const validate = (values: FormValues) => {
    const errs: FormikErrors<FormValues> = {}
    if (!values.file && !values.link) errs.file = 'Tutorial Archive or Link'

    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues,
    validate,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values)
    },
  })

  const getSubmitButtonContent = (isSubmitDisabled?: boolean) => {
    const maxErrorsCount = 5
    const errorsArr = Object.values(errors).map((err) => [
      err,
      <br key={err} />,
    ])

    if (errorsArr.length > maxErrorsCount) {
      errorsArr.splice(maxErrorsCount, errorsArr.length, ['...'])
    }
    return isSubmitDisabled ? <span>{errorsArr}</span> : null
  }

  const handleFileChange = (files: FileList | null) => {
    formik.setFieldValue('file', files?.[0] ?? null)
  }

  return (
    <div className={styles.outerWrapper}>
      <div className={styles.wrapper} data-testid="upload-tutorial-form">
        <RiText>Add new Tutorial</RiText>
        <RiSpacer size="m" />
        <div>
          <div className={styles.uploadFileWrapper}>
            <RiFilePicker
              id="import-tutorial"
              initialPromptText="Select or drop a file"
              className={styles.fileDrop}
              onChange={handleFileChange}
              display="large"
              accept=".zip"
              data-testid="import-tutorial"
              aria-label="Select or drop file"
            />
          </div>
          <div className={styles.hr}>OR</div>
          <RiTextInput
            placeholder="GitHub link to tutorials"
            value={formik.values.link}
            onChange={(value) => formik.setFieldValue('link', value)}
            className={styles.input}
            data-testid="tutorial-link-field"
          />
          <RiSpacer size="l" />
          <div className={styles.footer}>
            <CreateTutorialLink />
            <div className={styles.footerButtons}>
              <RiSecondaryButton
                size="s"
                onClick={() => onCancel?.()}
                data-testid="cancel-upload-tutorial-btn"
              >
                Cancel
              </RiSecondaryButton>
              <RiTooltip
                position="top"
                anchorClassName="euiToolTip__btn-disabled"
                title={
                  isSubmitDisabled
                    ? validationErrors.REQUIRED_TITLE(
                        Object.keys(errors).length,
                      )
                    : null
                }
                content={getSubmitButtonContent(isSubmitDisabled)}
              >
                <RiPrimaryButton
                  className={styles.btnSubmit}
                  size="s"
                  onClick={() => formik.handleSubmit()}
                  icon={isSubmitDisabled ? InfoIcon : undefined}
                  disabled={isSubmitDisabled}
                  data-testid="submit-upload-tutorial-btn"
                >
                  Submit
                </RiPrimaryButton>
              </RiTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadTutorialForm
