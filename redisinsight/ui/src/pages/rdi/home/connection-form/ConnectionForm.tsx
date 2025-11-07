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
import { isNull } from 'lodash'

import ReactDOM from 'react-dom'
import { SECURITY_FIELD } from 'uiSrc/constants'
import { RiTooltipProps } from 'uiSrc/components'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { getFormUpdates, Nullable } from 'uiSrc/utils'
import { useModalHeader } from 'uiSrc/contexts/ModalTitleProvider'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { PasswordInput, TextInput } from 'uiSrc/components/base/inputs'
import { Title } from 'uiSrc/components/base/text/Title'
import ValidationTooltip from './components/ValidationTooltip'

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
      <Row justify="end">
        <FlexItem>
          <Row gap="m">
            <FlexItem>
              <SecondaryButton
                data-testid="connection-form-cancel-button"
                onClick={onCancel}
              >
                Cancel
              </SecondaryButton>
            </FlexItem>
            <FlexItem>
              <ValidationTooltip isValid={isValid} errors={errors}>
                <PrimaryButton
                  data-testid="connection-form-add-button"
                  type="submit"
                  icon={!isValid ? InfoIcon : undefined}
                  loading={isLoading}
                  disabled={!isValid}
                  onClick={onSubmit}
                >
                  {editInstance ? 'Apply Changes' : 'Add Endpoint'}
                </PrimaryButton>
              </ValidationTooltip>
            </FlexItem>
          </Row>
        </FlexItem>
      </Row>,
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
        <Form>
          <Col data-testid="connection-form" gap="l">
            <FormField label="RDI Alias" required>
              <Field name="name">
                {({ field }: { field: FieldInputProps<string> }) => (
                  <TextInput
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
            </FormField>
            <FormField
              label="URL"
              required
              infoIconProps={{
                content:
                  'The RDI machine servers REST API via port 443. Ensure that Redis Insight can access the RDI host over port 443.',
              }}
            >
              <Field name="url">
                {({ field }: { field: FieldInputProps<string> }) => (
                  <TextInput
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
            </FormField>
            <FormField>
              <Row gap="xxl">
                <FlexItem grow={2}>
                  <FormField
                    label="Username"
                    infoIconProps={{
                      content:
                        'The RDI REST API authentication is using the RDI Redis username and password.',
                    }}
                  >
                    <Field name="username">
                      {({ field }: { field: FieldInputProps<string> }) => (
                        <TextInput
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
                  </FormField>
                </FlexItem>
                <FlexItem grow={1}>
                  <FormField
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
                        <PasswordInput
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
                  </FormField>
                </FlexItem>
              </Row>
            </FormField>
            <FlexItem grow>
              <Col justify="end">
                <Footer
                  isValid={isValid}
                  errors={errors}
                  onSubmit={() => handleSubmit(values)}
                />
              </Col>
            </FlexItem>
          </Col>
        </Form>
      )}
    </Formik>
  )
}

export default ConnectionForm
