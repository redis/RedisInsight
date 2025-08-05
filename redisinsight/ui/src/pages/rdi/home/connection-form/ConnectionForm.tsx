import {
  Field,
  FieldInputProps,
  FieldMetaProps,
  Form,
  Formik,
  FormikErrors,
  FormikHelpers,
} from 'formik'
import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { isNull } from 'lodash'

import ReactDOM from 'react-dom'
import { SECURITY_FIELD } from 'uiSrc/constants'
import { RiTooltip, RiTooltipProps } from 'uiSrc/components'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { getFormUpdates, Nullable } from 'uiSrc/utils'
import { useModalHeader } from 'uiSrc/contexts/ModalTitleProvider'
import { RiFlexItem, RiRow, RiSpacer } from 'uiSrc/components/base/layout'
import {
  RiPrimaryButton,
  RiSecondaryButton,
  RiFormField,
} from 'uiSrc/components/base/forms'
import { InfoIcon, RiIcon } from 'uiSrc/components/base/icons'
import { RiPasswordInput, RiTextInput } from 'uiSrc/components/base/inputs'
import { Title } from 'uiSrc/components/base/text/Title'
import ValidationTooltip from './components/ValidationTooltip'

import styles from './styles.module.scss'

export interface AppendInfoProps
  extends Omit<RiTooltipProps, 'children' | 'delay' | 'position'> {
  position?: RiTooltipProps['position']
}

export interface ConnectionFormValues {
  name: string
  url: string
  username: string
  password: Nullable<string>
}

export interface Props {
  onSubmit: (instance: Partial<RdiInstance>) => void
  onCancel: () => void
  editInstance: RdiInstance | null
  isLoading: boolean
}

const getInitialValues = (
  values: RdiInstance | null,
): ConnectionFormValues => ({
  name: values?.name || '',
  url: values?.url || '',
  username: values ? (values.username ?? '') : 'default',
  password: values ? null : '',
})

const AppendInfo = ({ title, content, ...rest }: AppendInfoProps) => (
  <RiTooltip
    anchorClassName="inputAppendIcon"
    position="right"
    title={title}
    content={content}
    {...rest}
  >
    <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
  </RiTooltip>
)

const ConnectionForm = (props: Props) => {
  const { onSubmit, onCancel, editInstance, isLoading } = props

  const [initialFormValues, setInitialFormValues] = useState(
    getInitialValues(editInstance),
  )
  const { setModalHeader } = useModalHeader()

  useEffect(() => {
    setInitialFormValues(getInitialValues(editInstance))
    setModalHeader(
      <Title size="M">
        {editInstance ? 'Edit endpoint' : 'Add RDI endpoint'}
      </Title>,
    )
  }, [editInstance])

  const validate = (values: ConnectionFormValues) => {
    const errors: FormikErrors<ConnectionFormValues> = {}

    if (!values.name) {
      errors.name = 'RDI Alias'
    }
    if (!values.url) {
      errors.url = 'URL'
    }

    return errors
  }

  const handleSubmit = (values: ConnectionFormValues) => {
    const updates = getFormUpdates(values, editInstance || {})
    onSubmit(updates)
  }

  const Footer = ({
    isValid,
    errors,
    onSubmit,
  }: {
    isValid: boolean
    errors: FormikErrors<ConnectionFormValues>
    onSubmit: () => void
  }) => {
    const footerEl = document.getElementById('footerDatabaseForm')

    if (!footerEl) return null

    return ReactDOM.createPortal(
      <RiRow className="footerAddDatabase" justify="between">
        <RiFlexItem />
        <RiFlexItem>
          <RiRow gap="m">
            <RiFlexItem>
              <RiSecondaryButton
                size="s"
                data-testid="connection-form-cancel-button"
                onClick={onCancel}
              >
                Cancel
              </RiSecondaryButton>
            </RiFlexItem>
            <RiFlexItem>
              <ValidationTooltip isValid={isValid} errors={errors}>
                <RiPrimaryButton
                  data-testid="connection-form-add-button"
                  type="submit"
                  size="s"
                  icon={!isValid ? InfoIcon : undefined}
                  loading={isLoading}
                  disabled={!isValid}
                  onClick={onSubmit}
                >
                  {editInstance ? 'Apply Changes' : 'Add Endpoint'}
                </RiPrimaryButton>
              </ValidationTooltip>
            </RiFlexItem>
          </RiRow>
        </RiFlexItem>
      </RiRow>,
      footerEl,
    )
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initialFormValues}
      validateOnMount
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ isValid, errors, values }) => (
        <Form className={styles.form}>
          <div className="databasePanelWrapper" data-testid="connection-form">
            <div className={cx('container relative')}>
              <RiFormField label="RDI Alias*" className={styles.withoutPadding}>
                <Field name="name">
                  {({ field }: { field: FieldInputProps<string> }) => (
                    <RiTextInput
                      data-testid="connection-form-name-input"
                      placeholder="Enter RDI Alias"
                      maxLength={500}
                      name={field.name}
                      value={field.value}
                      onChange={(value) =>
                        field.onChange({ target: { name: field.name, value } })
                      }
                    />
                  )}
                </Field>
              </RiFormField>
              <RiSpacer size="s" />
              <RiFormField
                label="URL*"
                infoIconProps={{
                  content:
                    'The RDI machine servers REST API via port 443. Ensure that Redis Insight can access the RDI host over port 443.',
                }}
              >
                <Field name="url">
                  {({ field }: { field: FieldInputProps<string> }) => (
                    <RiTextInput
                      data-testid="connection-form-url-input"
                      placeholder="Enter the RDI host IP as: https://[IP-Address]"
                      disabled={!!editInstance}
                      name={field.name}
                      value={field.value}
                      onChange={(value) =>
                        field.onChange({ target: { name: field.name, value } })
                      }
                    />
                  )}
                </Field>
              </RiFormField>
              <RiSpacer size="s" />
              <RiFormField>
                <RiRow gap="m">
                  <RiFlexItem grow={1}>
                    <RiFormField
                      label="Username"
                      infoIconProps={{
                        content:
                          'The RDI REST API authentication is using the RDI Redis username and password.',
                      }}
                    >
                      <Field name="username">
                        {({ field }: { field: FieldInputProps<string> }) => (
                          <RiTextInput
                            data-testid="connection-form-username-input"
                            placeholder="Enter the RDI Redis username"
                            maxLength={500}
                            name={field.name}
                            value={field.value}
                            onChange={(value) =>
                              field.onChange({
                                target: { name: field.name, value },
                              })
                            }
                          />
                        )}
                      </Field>
                    </RiFormField>
                  </RiFlexItem>
                  <RiFlexItem grow={1}>
                    <RiFormField
                      infoIconProps={{
                        content:
                          'The RDI REST API authentication is using the RDI Redis username and password.',
                      }}
                      label="Password"
                    >
                      <Field name="password">
                        {({
                          field,
                          form,
                          meta,
                        }: {
                          field: FieldInputProps<string>
                          form: FormikHelpers<string>
                          meta: FieldMetaProps<string>
                        }) => (
                          <RiPasswordInput
                            data-testid="connection-form-password-input"
                            placeholder="Enter the RDI Redis password"
                            maxLength={500}
                            {...field}
                            onChangeCapture={field.onChange}
                            value={
                              isNull(field.value) ? SECURITY_FIELD : field.value
                            }
                            onFocus={() => {
                              if (isNull(field.value) && !meta.touched) {
                                form.setFieldValue('password', '')
                              }
                            }}
                          />
                        )}
                      </Field>
                    </RiFormField>
                  </RiFlexItem>
                </RiRow>
              </RiFormField>
            </div>
            <Footer
              isValid={isValid}
              errors={errors}
              onSubmit={() => handleSubmit(values)}
            />
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ConnectionForm
