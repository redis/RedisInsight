import React, { useState } from 'react'
import { useFormik } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { toNumber } from 'lodash'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiEmptyButton, RiPrimaryButton, RiSecondaryButton } from 'uiBase/forms'
import { InfoIcon } from 'uiBase/icons'
import { Nullable, parseRedisUrl } from 'uiSrc/utils'

import { AddDbType, DEFAULT_TIMEOUT } from 'uiSrc/pages/home/constants'
import { Instance } from 'uiSrc/slices/interfaces'
import {
  createInstanceStandaloneAction,
  instancesSelector,
  testInstanceStandaloneAction,
} from 'uiSrc/slices/instances/instances'
import { Pages } from 'uiSrc/constants'
import ConnectivityOptions from './components/connectivity-options'
import ConnectionUrl from './components/connection-url'
import { Values } from './constants'

import styles from './styles.module.scss'
import { RiTooltip } from 'uiBase/display'

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
    <div className="eui-yScroll">
      <form onSubmit={formik.handleSubmit} data-testid="form">
        <RiRow responsive>
          <RiFlexItem grow>
            <ConnectionUrl
              value={formik.values.connectionURL}
              onChange={formik.handleChange}
            />
          </RiFlexItem>
        </RiRow>

        <RiRow responsive justify="between" style={{ padding: 4 }}>
          <RiFlexItem>
            <RiTooltip
              position="top"
              anchorClassName="euiToolTip__btn-disabled"
              content={isInvalid ? <span>{ConnectionUrlError}</span> : null}
            >
              <RiEmptyButton
                size="small"
                className="empty-btn"
                disabled={!!isInvalid}
                icon={isInvalid ? InfoIcon : undefined}
                onClick={handleTestConnection}
                loading={isLoading}
                data-testid="btn-test-connection"
              >
                Test Connection
              </RiEmptyButton>
            </RiTooltip>
          </RiFlexItem>
          <RiFlexItem>
            <RiRow responsive gap="l">
              <RiFlexItem>
                <RiSecondaryButton
                  size="small"
                  onClick={() => handleProceedForm(AddDbType.manual)}
                  data-testid="btn-connection-settings"
                >
                  Connection Settings
                </RiSecondaryButton>
              </RiFlexItem>
              <RiFlexItem>
                <RiTooltip
                  position="top"
                  anchorClassName="euiToolTip__btn-disabled"
                  content={isInvalid ? <span>{ConnectionUrlError}</span> : null}
                >
                  <RiPrimaryButton
                    size="small"
                    type="submit"
                    disabled={!!isInvalid}
                    icon={isInvalid ? InfoIcon : undefined}
                    data-testid="btn-submit"
                  >
                    Add Database
                  </RiPrimaryButton>
                </RiTooltip>
              </RiFlexItem>
            </RiRow>
          </RiFlexItem>
        </RiRow>
      </form>
      <RiSpacer />
      <div className={styles.hr}>Or</div>
      <RiSpacer />
      <ConnectivityOptions
        onClickOption={handleProceedForm}
        onClose={onClose}
      />
    </div>
  )
}

export default AddDatabaseScreen
