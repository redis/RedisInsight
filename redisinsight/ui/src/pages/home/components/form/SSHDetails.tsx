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
import { useTranslation } from 'uiSrc/i18n'

export interface Props {
  formik: FormikProps<DbConnectionInfo>
}

const SSHDetails = (props: Props) => {
  const { t } = useTranslation()
  const { formik } = props
  const id = useGenerateId('', ' ssh')

  const sshPassTypeOptions = [
    {
      id: SshPassType.Password,
      value: SshPassType.Password,
      label: t('home.form.ssh.passType.password'),
    },
    {
      id: SshPassType.PrivateKey,
      value: SshPassType.PrivateKey,
      label: t('home.form.ssh.passType.privateKey'),
    },
  ]

  return (
    <Col gap="m">
      <Row>
        <FormField>
          <Checkbox
            id={id}
            name="ssh"
            label={<Text>{t('home.form.ssh.useTunnel')}</Text>}
            checked={!!formik.values.ssh}
            onChange={formik.handleChange}
            data-testid="use-ssh"
          />
        </FormField>
      </Row>

      {formik.values.ssh && (
        <Col gap="l">
          <Row gap="m" responsive>
            <FlexItem grow>
              <FormField label={t('home.form.ssh.field.host')} required>
                <TextInput
                  name="sshHost"
                  id="sshHost"
                  data-testid="sshHost"
                  color="secondary"
                  maxLength={200}
                  placeholder={t('home.form.ssh.placeholder.host')}
                  value={formik.values.sshHost ?? ''}
                  onChange={(value) => {
                    formik.setFieldValue('sshHost', validateField(value.trim()))
                  }}
                />
              </FormField>
            </FlexItem>
            <FlexItem grow>
              <FormField label={t('home.form.ssh.field.port')} required>
                <NumericInput
                  autoValidate
                  min={0}
                  max={MAX_PORT_NUMBER}
                  name="sshPort"
                  id="sshPort"
                  data-testid="sshPort"
                  placeholder={t('home.form.ssh.placeholder.port')}
                  value={Number(formik.values.sshPort)}
                  onChange={(value) => formik.setFieldValue('sshPort', value)}
                  onFocus={selectOnFocus}
                />
              </FormField>
            </FlexItem>
          </Row>
          <Row responsive>
            <FlexItem grow>
              <FormField label={t('home.form.ssh.field.username')} required>
                <TextInput
                  name="sshUsername"
                  id="sshUsername"
                  data-testid="sshUsername"
                  color="secondary"
                  maxLength={200}
                  placeholder={t('home.form.ssh.placeholder.username')}
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
          <Row responsive>
            <FlexItem grow>
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
            <Row responsive>
              <FlexItem grow>
                <FormField label={t('home.form.ssh.field.password')}>
                  <PasswordInput
                    name="sshPassword"
                    id="sshPassword"
                    data-testid="sshPassword"
                    maxLength={10_000}
                    placeholder={t('home.form.ssh.placeholder.password')}
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
              <Row responsive>
                <FlexItem grow>
                  <FormField
                    label={t('home.form.ssh.field.privateKey')}
                    required
                  >
                    <TextArea
                      name="sshPrivateKey"
                      id="sshPrivateKey"
                      data-testid="sshPrivateKey"
                      maxLength={50_000}
                      placeholder={t('home.form.ssh.placeholder.privateKey')}
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
              <Row responsive>
                <FlexItem grow>
                  <FormField label={t('home.form.ssh.field.passphrase')}>
                    <PasswordInput
                      name="sshPassphrase"
                      id="sshPassphrase"
                      data-testid="sshPassphrase"
                      maxLength={50_000}
                      placeholder={t('home.form.ssh.placeholder.passphrase')}
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
