import React, { ChangeEvent } from 'react'
import { FormikProps } from 'formik'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'
import Divider from 'uiSrc/components/divider/Divider'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { NumericInput, TextInput } from 'uiSrc/components/base/inputs'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import {
  MAX_PORT_NUMBER,
  MAX_TIMEOUT_NUMBER,
  selectOnFocus,
  validateField,
} from 'uiSrc/utils'
import { Text } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'

export interface AzureManualConnectionFormValues {
  host: string
  port: string
  name: string
  username: string
  timeout: string
  verifyServerCert: boolean
  sni: boolean
  servername: string
}

export interface Props {
  formik: FormikProps<AzureManualConnectionFormValues>
}

const AzureManualConnectionForm = (props: Props) => {
  const { formik } = props
  const { t } = useTranslation()

  return (
    <form onSubmit={formik.handleSubmit} data-testid="azure-manual-form">
      <Col gap="l">
        {/* Database alias */}
        <Row gap="m">
          <FlexItem grow>
            <FormField
              label={t('autodiscover.azure.manual.aliasLabel')}
              required
            >
              <TextInput
                name="name"
                id="name"
                data-testid="name"
                placeholder={t('autodiscover.azure.manual.aliasPlaceholder')}
                onFocus={selectOnFocus}
                value={formik.values.name ?? ''}
                maxLength={500}
                onChangeCapture={formik.handleChange}
              />
            </FormField>
          </FlexItem>
        </Row>

        {/* Host and Port */}
        <Row gap="m">
          <FlexItem grow={4}>
            <FormField
              label={t('autodiscover.azure.manual.hostLabel')}
              required
            >
              <TextInput
                autoFocus
                name="host"
                id="host"
                data-testid="host"
                maxLength={200}
                placeholder={t('autodiscover.azure.manual.hostPlaceholder')}
                value={formik.values.host ?? ''}
                onChange={(value) => {
                  formik.setFieldValue('host', validateField(value.trim()))
                }}
                onFocus={selectOnFocus}
              />
            </FormField>
          </FlexItem>
          <FlexItem grow={2}>
            <FormField
              label={t('autodiscover.azure.manual.portLabel')}
              required
            >
              <NumericInput
                autoValidate
                name="port"
                id="port"
                data-testid="port"
                placeholder={t('autodiscover.azure.manual.portPlaceholder')}
                onChange={(value) => formik.setFieldValue('port', value)}
                value={Number(formik.values.port)}
                min={0}
                max={MAX_PORT_NUMBER}
                onFocus={selectOnFocus}
              />
            </FormField>
          </FlexItem>
        </Row>

        {/* Username (pre-filled from Entra ID, read-only info) */}
        <Row gap="m">
          <FlexItem grow>
            <Spacer size="xs" />
            <Text size="S" color="secondary">
              {t('autodiscover.azure.manual.entraCredentialsInfo')}
            </Text>

            <FormField label={t('autodiscover.azure.manual.usernameLabel')}>
              <Spacer size="s" />
              <TextInput
                name="username"
                id="username"
                data-testid="username"
                maxLength={200}
                placeholder={t('autodiscover.azure.manual.usernamePlaceholder')}
                value={formik.values.username ?? ''}
                onChangeCapture={formik.handleChange}
                disabled
              />
            </FormField>
          </FlexItem>
        </Row>

        {/* Timeout */}
        <Row gap="m" responsive>
          <FlexItem grow>
            <FormField label={t('autodiscover.azure.manual.timeoutLabel')}>
              <NumericInput
                autoValidate
                name="timeout"
                id="timeout"
                data-testid="timeout"
                placeholder={t('autodiscover.azure.manual.timeoutPlaceholder')}
                onChange={(value) => formik.setFieldValue('timeout', value)}
                value={Number(formik.values.timeout)}
                min={1}
                max={MAX_TIMEOUT_NUMBER}
                onFocus={selectOnFocus}
              />
            </FormField>
          </FlexItem>
          <FlexItem grow />
        </Row>

        <Spacer size="m" />
        <Divider />
        <Spacer size="m" />

        {/* TLS Settings - Simplified for Azure */}
        <Col gap="l">
          <Row gap="m">
            <FlexItem>
              <Text size="M">
                <b>{t('autodiscover.azure.manual.tlsSettings')}</b>
              </Text>
            </FlexItem>
          </Row>
          <Row gap="m">
            <FlexItem>
              <Text size="S" color="secondary">
                {t('autodiscover.azure.manual.tlsAlwaysEnabled')}
              </Text>
            </FlexItem>
          </Row>

          {/* Verify Server Certificate */}
          <Row gap="m">
            <FlexItem grow={1}>
              <Checkbox
                id="verifyServerCert"
                name="verifyServerCert"
                labelSize="M"
                label={t('autodiscover.azure.manual.verifyServerCert')}
                checked={!!formik.values.verifyServerCert}
                onChange={formik.handleChange}
                data-testid="verify-server-cert"
              />
            </FlexItem>
          </Row>
          <Row gap="m">
            <FlexItem>
              <Text size="XS" color="secondary">
                {t('autodiscover.azure.manual.verifyServerCertInfo')}
              </Text>
            </FlexItem>
          </Row>

          {/* SNI - Important for Private Link connections */}
          <Row gap="m">
            <FlexItem grow={1}>
              <Checkbox
                id="sni"
                name="sni"
                labelSize="M"
                label={t('autodiscover.azure.manual.useSni')}
                checked={!!formik.values.sni}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  // Pre-fill servername with host value when enabling SNI
                  if (e.target.checked && !formik.values.servername) {
                    formik.setFieldValue('servername', formik.values.host ?? '')
                  }
                  formik.handleChange(e)
                }}
                data-testid="sni"
              />
            </FlexItem>
          </Row>
          <Row gap="m">
            <FlexItem>
              <Text size="XS" color="secondary">
                {t('autodiscover.azure.manual.sniInfo')}
              </Text>
            </FlexItem>
          </Row>
          {formik.values.sni && (
            <Row gap="m">
              <FlexItem grow>
                <FormField
                  label={t('autodiscover.azure.manual.serverNameLabel')}
                  required
                >
                  <TextInput
                    name="servername"
                    id="servername"
                    maxLength={200}
                    placeholder="e.g., myredis.redis.cache.windows.net"
                    value={formik.values.servername ?? ''}
                    onChange={(value) =>
                      formik.setFieldValue(
                        'servername',
                        validateField(value.trim()),
                      )
                    }
                    data-testid="sni-servername"
                  />
                </FormField>
              </FlexItem>
            </Row>
          )}
        </Col>
      </Col>
    </form>
  )
}

export default AzureManualConnectionForm
