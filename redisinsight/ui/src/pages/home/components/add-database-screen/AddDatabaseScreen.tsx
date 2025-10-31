import React, { useState } from 'react'
import { useFormik } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { toNumber } from 'lodash'

import { Nullable, parseRedisUrl } from 'uiSrc/utils'
import { AddDbType, DEFAULT_TIMEOUT } from 'uiSrc/pages/home/constants'
import { Instance } from 'uiSrc/slices/interfaces'
import {
  createInstanceStandaloneAction,
  instancesSelector,
  testInstanceStandaloneAction,
} from 'uiSrc/slices/instances/instances'
import { Pages } from 'uiSrc/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  EmptyButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import ConnectivityOptions from './components/connectivity-options'
import ConnectionUrl from './components/connection-url'
import { Values } from './constants'
import { CustomHorizontalRule } from './AddDatabaseScreen.styles'

export interface Props {
  onSelectOption: (type: AddDbType, db: Nullable<Record<string, any>>) => void
  onClose?: () => void
}

const getPayload = (connectionUrl: string, returnOnError = false) => {
  const details = parseRedisUrl(connectionUrl.trim())

  if (!details && returnOnError) return null

  return {
    name: details?.hostname || '127.0.0.1:6379',
    host: details?.host || '127.0.0.1',
    port: details?.port || 6379,
    username: details?.username || 'default',
    password: details?.password || undefined,
    timeout: toNumber(DEFAULT_TIMEOUT),
    tls: details?.protocol === 'rediss',
    db: details?.dbNumber,
  }
}

const ConnectionUrlError = (
  <>
    The connection URL format provided is not supported.
    <br />
    Try adding a database using a connection form.
  </>
)

const AddDatabaseScreen = (props: Props) => {
  const { onSelectOption, onClose } = props
  const [isInvalid, setIsInvalid] = useState<Boolean>(false)
  const { loadingChanging: isLoading } = useSelector(instancesSelector)

  const dispatch = useDispatch()
  const history = useHistory()

  const validate = (values: Values) => {
    const payload = getPayload(values.connectionURL, true)
    setIsInvalid(!payload && !!values.connectionURL)
  }

  const handleTestConnection = () => {
    const payload = getPayload(formik.values.connectionURL)
    dispatch(testInstanceStandaloneAction(payload as Instance))
  }

  const handleProceedForm = (type: AddDbType) => {
    const details = getPayload(formik.values.connectionURL)
    onSelectOption(type, details)
  }

  const onSubmit = () => {
    if (isInvalid) return

    const payload = getPayload(formik.values.connectionURL)
    dispatch(
      createInstanceStandaloneAction(payload as Instance, () => {
        history.push(Pages.sentinelDatabases)
      }),
    )
  }

  const formik = useFormik<Values>({
    initialValues: {
      connectionURL: 'redis://default@127.0.0.1:6379',
    },
    validate,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit,
  })

  return (
    <div>
      <form onSubmit={formik.handleSubmit} data-testid="form">
        <Row responsive>
          <FlexItem grow>
            <ConnectionUrl
              value={formik.values.connectionURL}
              onChange={formik.handleChange}
            />
          </FlexItem>
        </Row>
        <Spacer size="xxl" />
        <Row responsive justify="between" align="center">
          <FlexItem>
            <RiTooltip
              position="top"
              anchorClassName="euiToolTip__btn-disabled"
              content={isInvalid ? <span>{ConnectionUrlError}</span> : null}
            >
              <EmptyButton
                size="small"
                className="empty-btn"
                disabled={!!isInvalid}
                icon={isInvalid ? InfoIcon : undefined}
                onClick={handleTestConnection}
                loading={isLoading}
                data-testid="btn-test-connection"
              >
                Test connection
              </EmptyButton>
            </RiTooltip>
          </FlexItem>
          <FlexItem>
            <Row responsive gap="l">
              <FlexItem>
                <SecondaryButton
                  size="medium"
                  onClick={() => handleProceedForm(AddDbType.manual)}
                  data-testid="btn-connection-settings"
                >
                  Connection settings
                </SecondaryButton>
              </FlexItem>
              <FlexItem>
                <RiTooltip
                  position="top"
                  anchorClassName="euiToolTip__btn-disabled"
                  content={isInvalid ? <span>{ConnectionUrlError}</span> : null}
                >
                  <PrimaryButton
                    size="medium"
                    type="submit"
                    disabled={!!isInvalid}
                    icon={isInvalid ? InfoIcon : undefined}
                    data-testid="btn-submit"
                  >
                    Add database
                  </PrimaryButton>
                </RiTooltip>
              </FlexItem>
            </Row>
          </FlexItem>
        </Row>
      </form>
      <Spacer />
      <CustomHorizontalRule>Or</CustomHorizontalRule>
      <Spacer />
      <ConnectivityOptions
        onClickOption={handleProceedForm}
        onClose={onClose}
      />
    </div>
  )
}

export default AddDatabaseScreen
