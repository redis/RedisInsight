import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { FormikProps } from 'formik'

import { BuildType } from 'uiSrc/constants/env'
import { SECURITY_FIELD } from 'uiSrc/constants'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import {
  handlePasteHostName,
  MAX_PORT_NUMBER,
  MAX_TIMEOUT_NUMBER,
  selectOnFocus,
  validateField,
} from 'uiSrc/utils'
import { RedisConnectionFamily } from 'apiClient'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  FormField,
  RiInfoIconProps,
} from 'uiSrc/components/base/forms/FormField'
import {
  NumericInput,
  PasswordInput,
  TextInput,
} from 'uiSrc/components/base/inputs'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { HostInfoTooltipContent } from '../host-info-tooltip-content/HostInfoTooltipContent'

interface IShowFields {
  alias: boolean
  host: boolean
  port: boolean
  timeout: boolean
}

const hostInfo: RiInfoIconProps = {
  content: HostInfoTooltipContent({ includeAutofillInfo: true }),
  placement: 'right',
  maxWidth: '100%',
}

const CONNECTION_FAMILY_OPTIONS = [
  { value: RedisConnectionFamily.Auto, label: 'Auto (IPv4 & IPv6)' },
  { value: RedisConnectionFamily.Ipv4, label: 'IPv4' },
  { value: RedisConnectionFamily.Ipv6, label: 'IPv6' },
]

const connectionFamilyInfo: RiInfoIconProps = {
  content:
    'Choose which IP protocol to use when connecting. Use IPv4 or IPv6 if the host does not resolve correctly over the other protocol.',
  placement: 'right',
  maxWidth: '100%',
}

export interface Props {
  formik: FormikProps<DbConnectionInfo>
  onHostNamePaste: (content: string) => boolean
  showFields: IShowFields
  autoFocus?: boolean
  readyOnlyFields?: string[]
}

const DatabaseForm = (props: Props) => {
  const {
    formik,
    onHostNamePaste,
    autoFocus = false,
    showFields,
    readyOnlyFields = [],
  } = props

  const { server } = useAppSelector(appInfoSelector)

  const isShowPort =
    server?.buildType !== BuildType.RedisStack && showFields.port
  const isFieldDisabled = (name: string) => readyOnlyFields.includes(name)

  return (
    <Col gap="l">
      {showFields.alias && (
        <Row gap="m">
          <FlexItem grow>
            <FormField label="Database alias" required>
              <TextInput
                name="name"
                id="name"
                data-testid="name"
                placeholder="Enter Database Alias"
                onFocus={selectOnFocus}
                value={formik.values.name ?? ''}
                maxLength={500}
                onChangeCapture={formik.handleChange}
                disabled={isFieldDisabled('alias')}
              />
            </FormField>
          </FlexItem>
        </Row>
      )}
      {(showFields.host || isShowPort) && (
        <Row gap="m">
          {showFields.host && (
            <FlexItem grow={4}>
              <FormField label="Host" required infoIconProps={hostInfo}>
                <TextInput
                  autoFocus={autoFocus}
                  name="ip"
                  id="host"
                  data-testid="host"
                  color="secondary"
                  maxLength={200}
                  placeholder="Enter Hostname / IP address / Connection URL"
                  value={formik.values.host ?? ''}
                  onChange={(value) => {
                    formik.setFieldValue('host', validateField(value.trim()))
                  }}
                  onPaste={(event: React.ClipboardEvent<HTMLInputElement>) =>
                    handlePasteHostName(onHostNamePaste, event)
                  }
                  onFocus={selectOnFocus}
                  disabled={isFieldDisabled('host')}
                />
              </FormField>
            </FlexItem>
          )}
          {isShowPort && (
            <FlexItem grow={2}>
              <FormField label="Port" required>
                <NumericInput
                  autoValidate
                  name="port"
                  id="port"
                  data-testid="port"
                  placeholder="Enter Port"
                  onChange={(value) => formik.setFieldValue('port', value)}
                  value={Number(formik.values.port)}
                  min={0}
                  max={MAX_PORT_NUMBER}
                  onFocus={selectOnFocus}
                  disabled={isFieldDisabled('port')}
                />
              </FormField>
            </FlexItem>
          )}
        </Row>
      )}

      {showFields.host && (
        <Row gap="m">
          <FlexItem grow>
            <FormField label="IP protocol" infoIconProps={connectionFamilyInfo}>
              <RiSelect
                name="connectionFamily"
                data-testid="connectionFamily"
                value={
                  formik.values.connectionFamily ?? RedisConnectionFamily.Auto
                }
                options={CONNECTION_FAMILY_OPTIONS}
                onChange={(value) =>
                  formik.setFieldValue('connectionFamily', value)
                }
                disabled={isFieldDisabled('connectionFamily')}
              />
            </FormField>
          </FlexItem>
          <FlexItem grow />
        </Row>
      )}

      <Row gap="m">
        <FlexItem grow>
          <FormField label="Username">
            <TextInput
              name="username"
              id="username"
              data-testid="username"
              maxLength={200}
              placeholder="Enter Username"
              value={formik.values.username ?? ''}
              onChangeCapture={formik.handleChange}
              disabled={isFieldDisabled('username')}
            />
          </FormField>
        </FlexItem>

        <FlexItem grow>
          <FormField label="Password">
            <PasswordInput
              name="password"
              id="password"
              data-testid="password"
              maxLength={10_000}
              placeholder="Enter Password"
              value={
                formik.values.password === true
                  ? SECURITY_FIELD
                  : (formik.values.password ?? '')
              }
              onChangeCapture={formik.handleChange}
              onFocus={() => {
                if (formik.values.password === true) {
                  formik.setFieldValue('password', '')
                }
              }}
              autoComplete="new-password"
              disabled={isFieldDisabled('password')}
            />
          </FormField>
        </FlexItem>
      </Row>

      {showFields.timeout && (
        <Row gap="m" responsive>
          <FlexItem grow>
            <FormField label="Timeout (s)">
              <NumericInput
                autoValidate
                name="timeout"
                id="timeout"
                data-testid="timeout"
                placeholder="Enter Timeout (in seconds)"
                onChange={(value) => formik.setFieldValue('timeout', value)}
                value={Number(formik.values.timeout)}
                min={1}
                max={MAX_TIMEOUT_NUMBER}
                onFocus={selectOnFocus}
                disabled={isFieldDisabled('timeout')}
              />
            </FormField>
          </FlexItem>
          <FlexItem grow />
        </Row>
      )}
    </Col>
  )
}

export default DatabaseForm
