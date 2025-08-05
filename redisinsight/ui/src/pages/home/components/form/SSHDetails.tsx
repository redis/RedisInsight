import React from 'react'
import { FormikProps } from 'formik'

import { MAX_PORT_NUMBER, selectOnFocus, validateField } from 'uiSrc/utils'
import { SECURITY_FIELD } from 'uiSrc/constants'

import { SshPassType } from 'uiSrc/pages/home/constants'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

import { RiCol, RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import {
  RiFormField,
  RiCheckbox,
  RiRadioGroup,
} from 'uiSrc/components/base/forms'
import {
  RiNumericInput,
  RiPasswordInput,
  RiTextArea,
  RiTextInput,
} from 'uiSrc/components/base/inputs'
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
    <RiCol gap="m">
      <RiRow
        className={flexGroupClassName}
        align={!flexGroupClassName ? 'end' : undefined}
      >
        <RiFlexItem style={{ width: '230px' }} className={flexItemClassName}>
          <RiCheckbox
            id={id}
            name="ssh"
            label="Use SSH Tunnel"
            checked={!!formik.values.ssh}
            onChange={formik.handleChange}
            data-testid="use-ssh"
          />
        </RiFlexItem>
      </RiRow>

      {formik.values.ssh && (
        <RiCol gap="l">
          <RiRow gap="m" responsive className={flexGroupClassName}>
            <RiFlexItem grow className={flexItemClassName}>
              <RiFormField label="Host*">
                <RiTextInput
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
              </RiFormField>
            </RiFlexItem>
            <RiFlexItem grow className={flexItemClassName}>
              <RiFormField
                label="Port*"
                additionalText="Should not exceed 65535."
              >
                <RiNumericInput
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
              </RiFormField>
            </RiFlexItem>
          </RiRow>
          <RiRow responsive className={flexGroupClassName}>
            <RiFlexItem grow className={flexItemClassName}>
              <RiFormField label="Username*">
                <RiTextInput
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
              </RiFormField>
            </RiFlexItem>
          </RiRow>
          <RiRow responsive className={flexGroupClassName}>
            <RiFlexItem grow className={flexItemClassName}>
              <RiRadioGroup
                id="sshPassType"
                items={sshPassTypeOptions}
                layout="horizontal"
                value={formik.values.sshPassType}
                onChange={(id) => formik.setFieldValue('sshPassType', id)}
                data-testid="ssh-pass-type"
              />
            </RiFlexItem>
          </RiRow>

          {formik.values.sshPassType === SshPassType.Password && (
            <RiRow responsive className={flexGroupClassName}>
              <RiFlexItem grow className={flexItemClassName}>
                <RiFormField label="Password">
                  <RiPasswordInput
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
                </RiFormField>
              </RiFlexItem>
            </RiRow>
          )}

          {formik.values.sshPassType === SshPassType.PrivateKey && (
            <RiCol gap="m">
              <RiRow responsive className={flexGroupClassName}>
                <RiFlexItem grow className={flexItemClassName}>
                  <RiFormField label="Private Key*">
                    <RiTextArea
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
                  </RiFormField>
                </RiFlexItem>
              </RiRow>
              <RiRow responsive className={flexGroupClassName}>
                <RiFlexItem grow className={flexItemClassName}>
                  <RiFormField label="Passphrase">
                    <RiPasswordInput
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
                  </RiFormField>
                </RiFlexItem>
              </RiRow>
            </RiCol>
          )}
        </RiCol>
      )}
    </RiCol>
  )
}

export default SSHDetails
