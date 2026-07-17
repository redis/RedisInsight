import React, { useEffect, useState } from 'react'
import { Field, FieldInputProps, Form, Formik, FormikErrors } from 'formik'
import ReactDOM from 'react-dom'

import { Nullable, getFormUpdates } from 'uiSrc/utils'
import { useModalHeader } from 'uiSrc/contexts/ModalTitleProvider'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import {
  defaultValueRender,
  RiSelect,
} from 'uiSrc/components/base/forms/select/RiSelect'
import { PasswordInput, TextInput } from 'uiSrc/components/base/inputs'
import { Title } from 'uiSrc/components/base/text/Title'
import {
  AgentMemoryBackendType,
  AgentMemoryEndpoint,
} from 'uiSrc/slices/interfaces/agentMemory'

export interface ConnectionFormValues {
  name: string
  url: string
  backendType: AgentMemoryBackendType
  storeId: string
  apiKey: Nullable<string>
}

export interface EndpointConnectionFormProps {
  onSubmit: (endpoint: Partial<AgentMemoryEndpoint>) => void
  onCancel: () => void
  editEndpoint: Nullable<AgentMemoryEndpoint>
  isLoading: boolean
}

const BACKEND_TYPE_OPTIONS = [
  {
    value: AgentMemoryBackendType.Oss,
    label: 'OSS server (self-hosted)',
  },
  {
    value: AgentMemoryBackendType.Cloud,
    label: 'Redis Cloud (hosted)',
  },
]

const getInitialValues = (
  values: Nullable<AgentMemoryEndpoint>,
): ConnectionFormValues => ({
  name: values?.name || '',
  url: values?.url || '',
  backendType: values?.backendType || AgentMemoryBackendType.Oss,
  storeId: values?.storeId || '',
  // null on edit so an untouched masked field is not sent as an update
  apiKey: values ? null : '',
})

const EndpointConnectionForm = (props: EndpointConnectionFormProps) => {
  const { onSubmit, onCancel, editEndpoint, isLoading } = props

  const [initialFormValues, setInitialFormValues] = useState(
    getInitialValues(editEndpoint),
  )
  const { setModalHeader } = useModalHeader()

  useEffect(() => {
    setInitialFormValues(getInitialValues(editEndpoint))
    setModalHeader(
      <Title size="M">
        {editEndpoint ? 'Edit endpoint' : 'Add agent memory endpoint'}
      </Title>,
    )
  }, [editEndpoint])

  const validate = (values: ConnectionFormValues) => {
    const errors: FormikErrors<ConnectionFormValues> = {}

    if (!values.name) {
      errors.name = 'Name'
    }
    if (!values.url) {
      errors.url = 'URL'
    }
    if (values.backendType === AgentMemoryBackendType.Cloud) {
      if (!values.storeId) {
        errors.storeId = 'Store ID'
      }
      // A stored key can be kept only when the endpoint was already
      // Cloud (keys are never sent back to the UI, so an endpoint being
      // switched from OSS cannot be assumed to have one).
      const hasStoredCloudKey =
        editEndpoint?.backendType === AgentMemoryBackendType.Cloud
      if (!hasStoredCloudKey && !values.apiKey) {
        errors.apiKey = 'API Key'
      }
    }

    return errors
  }

  const handleSubmit = (values: ConnectionFormValues) => {
    const updates = getFormUpdates(values, editEndpoint || {})
    onSubmit(updates)
  }

  const Footer = ({
    isValid,
    onSubmit: onFormSubmit,
  }: {
    isValid: boolean
    onSubmit: () => void
  }) => {
    const footerEl = document.getElementById('footerDatabaseForm')

    if (!footerEl) return null

    return ReactDOM.createPortal(
      <Row justify="end" gap="m">
        <FlexItem>
          <SecondaryButton
            data-testid="endpoint-form-cancel-button"
            onClick={onCancel}
          >
            Cancel
          </SecondaryButton>
        </FlexItem>
        <FlexItem>
          <PrimaryButton
            data-testid="endpoint-form-submit-button"
            type="submit"
            loading={isLoading}
            disabled={!isValid}
            onClick={onFormSubmit}
          >
            {editEndpoint ? 'Apply Changes' : 'Add Endpoint'}
          </PrimaryButton>
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
      {({ isValid, values, setFieldValue, submitForm }) => (
        <Form>
          <Col data-testid="endpoint-connection-form" gap="l">
            <FormField label="Name" required>
              <Field name="name">
                {({ field }: { field: FieldInputProps<string> }) => (
                  <TextInput
                    data-testid="endpoint-form-name-input"
                    placeholder="Enter a name for the endpoint"
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
            <FormField label="Backend">
              <RiSelect
                data-testid="endpoint-form-backend-select"
                options={BACKEND_TYPE_OPTIONS}
                value={values.backendType}
                valueRender={defaultValueRender}
                onChange={(value) => setFieldValue('backendType', value)}
              />
            </FormField>
            <FormField
              label="URL"
              required
              infoIconProps={{
                content:
                  values.backendType === AgentMemoryBackendType.Cloud
                    ? 'The Redis Cloud agent memory endpoint, e.g. https://gcp-us-east4.memory.redis.io'
                    : 'The Redis Agent Memory Server base URL, e.g. http://localhost:8000',
              }}
            >
              <Field name="url">
                {({ field }: { field: FieldInputProps<string> }) => (
                  <TextInput
                    data-testid="endpoint-form-url-input"
                    placeholder={
                      values.backendType === AgentMemoryBackendType.Cloud
                        ? 'https://[region].memory.redis.io'
                        : 'http://localhost:8000'
                    }
                    name={field.name}
                    value={field.value}
                    onChange={(value) =>
                      field.onChange({ target: { name: field.name, value } })
                    }
                  />
                )}
              </Field>
            </FormField>
            {values.backendType === AgentMemoryBackendType.Cloud && (
              <FormField
                label="Store ID"
                required
                infoIconProps={{
                  content: 'The store identifier from the Redis Cloud console.',
                }}
              >
                <Field name="storeId">
                  {({ field }: { field: FieldInputProps<string> }) => (
                    <TextInput
                      data-testid="endpoint-form-store-id-input"
                      placeholder="Enter the store ID"
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
            )}
            <FormField
              label="API Key"
              required={
                values.backendType === AgentMemoryBackendType.Cloud &&
                editEndpoint?.backendType !== AgentMemoryBackendType.Cloud
              }
              infoIconProps={{
                content:
                  values.backendType === AgentMemoryBackendType.Cloud
                    ? 'The bearer token from the Redis Cloud console.'
                    : 'Optional bearer token - only needed when the server has auth enabled.',
              }}
            >
              <Field name="apiKey">
                {({ field }: { field: FieldInputProps<string> }) => (
                  <PasswordInput
                    data-testid="endpoint-form-api-key-input"
                    placeholder="Enter the API key"
                    maxLength={10_000}
                    {...field}
                    value={field.value ?? ''}
                    onChangeCapture={field.onChange}
                  />
                )}
              </Field>
            </FormField>
          </Col>
          <Footer isValid={isValid} onSubmit={submitForm} />
        </Form>
      )}
    </Formik>
  )
}

export default EndpointConnectionForm
