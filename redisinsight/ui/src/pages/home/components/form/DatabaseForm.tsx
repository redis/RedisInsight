import React from 'react'
import { useSelector } from 'react-redux'
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
import { RiTooltip } from 'uiSrc/components'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import {
  NumericInput,
  PasswordInput,
  TextInput,
} from 'uiSrc/components/base/inputs'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

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
              <FormField
                label="Host"
                additionalText={<AppendHostName />}
                required
              >
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
              <FormField
                label="Port"
                additionalText={`Should not exceed ${MAX_PORT_NUMBER}.`}
                required
              >
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
