import React, { useState } from 'react'
import { EuiFieldText } from '@elastic/eui'
import { useFormik } from 'formik'
import { FormikErrors } from 'formik/dist/types'
import { isEmpty } from 'lodash'

import { Nullable } from 'uiSrc/utils'
import validationErrors from 'uiSrc/constants/validationErrors'
import { RiFilePicker, RiTooltip } from 'uiSrc/components'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
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
        <Text>Add new Tutorial</Text>
        <Spacer size="m" />
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
          <EuiFieldText
            placeholder="GitHub link to tutorials"
            value={formik.values.link}
            onChange={(e) => formik.setFieldValue('link', e.target.value)}
            className={styles.input}
            data-testid="tutorial-link-field"
          />
          <Spacer size="l" />
          <div className={styles.footer}>
            <CreateTutorialLink />
            <div className={styles.footerButtons}>
              <SecondaryButton
                size="s"
                onClick={() => onCancel?.()}
                data-testid="cancel-upload-tutorial-btn"
              >
                Cancel
              </SecondaryButton>
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
                <PrimaryButton
                  className={styles.btnSubmit}
                  size="s"
                  onClick={() => formik.handleSubmit()}
                  icon={isSubmitDisabled ? InfoIcon : undefined}
                  disabled={isSubmitDisabled}
                  data-testid="submit-upload-tutorial-btn"
                >
                  Submit
                </PrimaryButton>
              </RiTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadTutorialForm
