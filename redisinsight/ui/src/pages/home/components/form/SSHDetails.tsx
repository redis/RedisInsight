import React from 'react'
import { FormikProps } from 'formik'

import { MAX_PORT_NUMBER, selectOnFocus, validateField } from 'uiSrc/utils'
import { SECURITY_FIELD } from 'uiSrc/constants'

import { SshPassType } from 'uiSrc/pages/home/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import {
  NumericInput,
  PasswordInput,
  TextArea,
  TextInput,
} from 'uiSrc/components/base/inputs'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { RiRadioGroup } from 'uiSrc/components/base/forms/radio-group/RadioGroup'
import { Text } from 'uiSrc/components/base/text/Text'
import { useGenerateId } from 'uiSrc/components/base/utils/hooks/generate-id'

export interface Props {
  flexGroupClassName?: string
  flexItemClassName?: string
  formik: FormikProps<DbConnectionInfo>
}

const sshPassTypeOptions = [
  {
    id: SshPassType.Password,
    value: SshPassType.Password,
    label: 'Password',
    // 'data-test-subj': 'radio-btn-password',
  },
  {
    id: SshPassType.PrivateKey,
    value: SshPassType.PrivateKey,
    label: 'Private Key',
    // 'data-test-subj': 'radio-btn-privateKey',
  },
]

const SSHDetails = (props: Props) => {
  const { flexGroupClassName = '', flexItemClassName = '', formik } = props
  const id = useGenerateId('', ' ssh')

  return (
    <Col gap="m">
      <Row
        className={flexGroupClassName}
        align={!flexGroupClassName ? 'end' : undefined}
      >
        <FlexItem style={{ width: '230px' }} className={flexItemClassName}>
          <FormField>
            <Checkbox
              id={id}
              name="ssh"
              label={<Text>Use SSH Tunnel</Text>}
              checked={!!formik.values.ssh}
              onChange={formik.handleChange}
              data-testid="use-ssh"
            />
          </FormField>
        </FlexItem>
      </Row>

      {formik.values.ssh && (
        <Col gap="l">
          <Row gap="m" responsive className={flexGroupClassName}>
            <FlexItem grow className={flexItemClassName}>
              <FormField label="Host" required>
                <TextInput
                  name="sshHost"
                  id="sshHost"
                  data-testid="sshHost"
                  color="secondary"
                  maxLength={200}
                  placeholder="Enter SSH Host"
                  value={formik.values.sshHost ?? ''}
                  onChange={(value) => {
                    formik.setFieldValue('sshHost', validateField(value.trim()))
                  }}
                />
              </FormField>
            </FlexItem>
            <FlexItem grow className={flexItemClassName}>
              <FormField label="Port" required>
                <NumericInput
                  autoValidate
                  min={0}
                  max={MAX_PORT_NUMBER}
                  name="sshPort"
                  id="sshPort"
                  data-testid="sshPort"
                  placeholder="Enter SSH Port"
                  value={Number(formik.values.sshPort)}
                  onChange={(value) => formik.setFieldValue('sshPort', value)}
                  onFocus={selectOnFocus}
                />
              </FormField>
            </FlexItem>
          </Row>
          <Row responsive className={flexGroupClassName}>
            <FlexItem grow className={flexItemClassName}>
              <FormField label="Username" required>
                <TextInput
                  name="sshUsername"
                  id="sshUsername"
                  data-testid="sshUsername"
                  color="secondary"
                  maxLength={200}
                  placeholder="Enter SSH Username"
                  value={formik.values.sshUsername ?? ''}
                  onChange={(value) => {
                    formik.setFieldValue(
                      'sshUsername',
                      validateField(value.trim()),
                    )
                  }}
                />
              </FormField>
            </FlexItem>
          </Row>
          <Row responsive className={flexGroupClassName}>
            <FlexItem grow className={flexItemClassName}>
              <RiRadioGroup
                id="sshPassType"
                items={sshPassTypeOptions}
                layout="horizontal"
                value={formik.values.sshPassType}
                onChange={(id) => formik.setFieldValue('sshPassType', id)}
                data-testid="ssh-pass-type"
              />
            </FlexItem>
          </Row>
          {formik.values.sshPassType === SshPassType.Password && (
            <Row responsive className={flexGroupClassName}>
              <FlexItem grow className={flexItemClassName}>
                <FormField label="Password">
                  <PasswordInput
                    name="sshPassword"
                    id="sshPassword"
                    data-testid="sshPassword"
                    maxLength={10_000}
                    placeholder="Enter SSH Password"
                    value={
                      formik.values.sshPassword === true
                        ? SECURITY_FIELD
                        : (formik.values.sshPassword ?? '')
                    }
                    onChangeCapture={formik.handleChange}
                    onFocus={() => {
                      if (formik.values.sshPassword === true) {
                        formik.setFieldValue('sshPassword', '')
                      }
                    }}
                    autoComplete="new-password"
                  />
                </FormField>
              </FlexItem>
            </Row>
          )}

          {formik.values.sshPassType === SshPassType.PrivateKey && (
            <Col gap="l">
              <Row responsive className={flexGroupClassName}>
                <FlexItem grow className={flexItemClassName}>
                  <FormField label="Private Key" required>
                    <TextArea
                      name="sshPrivateKey"
                      id="sshPrivateKey"
                      data-testid="sshPrivateKey"
                      maxLength={50_000}
                      placeholder="Enter SSH Private Key in PEM format"
                      value={
                        formik.values.sshPrivateKey === true
                          ? SECURITY_FIELD
                          : (formik?.values?.sshPrivateKey?.replace(
                            /./g,
                            '•',
                          ) ?? '')
                      }
                      onChangeCapture={formik.handleChange}
                      onFocus={() => {
                        if (formik.values.sshPrivateKey === true) {
                          formik.setFieldValue('sshPrivateKey', '')
                        }
                      }}
                    />
                  </FormField>
                </FlexItem>
              </Row>
              <Row responsive className={flexGroupClassName}>
                <FlexItem grow className={flexItemClassName}>
                  <FormField label="Passphrase">
                    <PasswordInput
                      name="sshPassphrase"
                      id="sshPassphrase"
                      data-testid="sshPassphrase"
                      maxLength={50_000}
                      placeholder="Enter Passphrase for Private Key"
                      value={
                        formik.values.sshPassphrase === true
                          ? SECURITY_FIELD
                          : (formik.values.sshPassphrase ?? '')
                      }
                      onChangeCapture={formik.handleChange}
                      onFocus={() => {
                        if (formik.values.sshPassphrase === true) {
                          formik.setFieldValue('sshPassphrase', '')
                        }
                      }}
                      autoComplete="new-password"
                    />
                  </FormField>
                </FlexItem>
              </Row>
            </Col>
          )}
        </Col>
      )}
    </Col>
  )
}

export default SSHDetails
