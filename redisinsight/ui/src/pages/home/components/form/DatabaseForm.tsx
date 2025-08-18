import React from 'react'
import { useSelector } from 'react-redux'
import { FormikProps } from 'formik'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiFormField } from 'uiBase/forms'
import { RiNumericInput, RiPasswordInput, RiTextInput } from 'uiBase/inputs'
import { RiIcon } from 'uiBase/icons'
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
import { RiTooltip } from 'uiSrc/components'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'

interface IShowFields {
  alias: boolean
  host: boolean
  port: boolean
  timeout: boolean
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

  const { server } = useSelector(appInfoSelector)

  const AppendHostName = () => (
    <RiTooltip
      title={
        <div>
          <p>
            <b>Pasting a connection URL auto fills the database details.</b>
          </p>
          <p style={{ margin: 0, paddingTop: '10px' }}>
            The following connection URLs are supported:
          </p>
        </div>
      }
      className="homePage_tooltip"
      anchorClassName="inputAppendIcon"
      position="right"
      content={
        <ul className="homePage_toolTipUl">
          <li>
            <span className="dot" />
            redis://[[username]:[password]]@host:port
          </li>
          <li>
            <span className="dot" />
            rediss://[[username]:[password]]@host:port
          </li>
          <li>
            <span className="dot" />
            host:port
          </li>
        </ul>
      }
    >
      <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
    </RiTooltip>
  )

  const isShowPort =
    server?.buildType !== BuildType.RedisStack && showFields.port
  const isFieldDisabled = (name: string) => readyOnlyFields.includes(name)

  return (
    <>
      {showFields.alias && (
        <RiRow gap="m">
          <RiFlexItem grow>
            <RiFormField label="Database Alias*">
              <RiTextInput
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
            </RiFormField>
          </RiFlexItem>
        </RiRow>
      )}

      {(showFields.host || isShowPort) && (
        <RiRow gap="m">
          {showFields.host && (
            <RiFlexItem grow={4}>
              <RiFormField label="Host*" additionalText={<AppendHostName />}>
                <RiTextInput
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
              </RiFormField>
            </RiFlexItem>
          )}
          {isShowPort && (
            <RiFlexItem grow={2}>
              <RiFormField
                label="Port*"
                additionalText={`Should not exceed ${MAX_PORT_NUMBER}.`}
              >
                <RiNumericInput
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
              </RiFormField>
            </RiFlexItem>
          )}
        </RiRow>
      )}

      <RiRow gap="m">
        <RiFlexItem grow>
          <RiFormField label="Username">
            <RiTextInput
              name="username"
              id="username"
              data-testid="username"
              maxLength={200}
              placeholder="Enter Username"
              value={formik.values.username ?? ''}
              onChangeCapture={formik.handleChange}
              disabled={isFieldDisabled('username')}
            />
          </RiFormField>
        </RiFlexItem>

        <RiFlexItem grow>
          <RiFormField label="Password">
            <RiPasswordInput
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
          </RiFormField>
        </RiFlexItem>
      </RiRow>

      {showFields.timeout && (
        <RiRow gap="m" responsive>
          <RiFlexItem grow>
            <RiFormField label="Timeout (s)">
              <RiNumericInput
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
            </RiFormField>
          </RiFlexItem>
          <RiFlexItem grow />
        </RiRow>
      )}
    </>
  )
}

export default DatabaseForm
