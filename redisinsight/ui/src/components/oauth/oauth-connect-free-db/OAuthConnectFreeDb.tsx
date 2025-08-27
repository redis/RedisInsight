import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useLocation } from 'react-router-dom'
import cx from 'classnames'
import {
  TelemetryEvent,
  getRedisModulesSummary,
  sendEventTelemetry,
  getRedisInfoSummary,
} from 'uiSrc/telemetry'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import {
  checkConnectToInstanceAction,
  connectedInstanceSelector,
  freeInstancesSelector,
  instancesSelector,
} from 'uiSrc/slices/instances/instances'
import { openNewWindowDatabase } from 'uiSrc/utils'
import { Pages } from 'uiSrc/constants'
import { setCapability } from 'uiSrc/slices/app/context'

import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import styles from './styles.module.scss'

interface Props {
  id?: string
  source?: OAuthSocialSource | string
  onSuccessClick?: () => void
  className?: string
}

const OAuthConnectFreeDb = ({
  id = '',
  source = OAuthSocialSource.ListOfDatabases,
  onSuccessClick,
  className,
}: Props) => {
  const { loading } = useSelector(instancesSelector) ?? {}
  const { modules, provider } = useSelector(connectedInstanceSelector) ?? {}
  const [firstFreeInstance] = useSelector(freeInstancesSelector) ?? []

  const targetDatabaseId = id || firstFreeInstance?.id

  const dispatch = useDispatch()
  const { search } = useLocation()

  if (!targetDatabaseId) {
    return null
  }

  const sendTelemetry = async () => {
    const modulesSummary = getRedisModulesSummary(modules)
    const infoData = await getRedisInfoSummary(targetDatabaseId)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_OPEN_DATABASE,
      eventData: {
        databaseId: targetDatabaseId,
        provider,
        source,
        ...modulesSummary,
        ...infoData,
      },
    })
  }

  const connectToInstanceSuccess = () => {
    onSuccessClick?.()

    openNewWindowDatabase(Pages.browser(targetDatabaseId) + search)
  }

  const handleCheckConnectToInstance = async () => {
    await sendTelemetry()
    dispatch(setCapability({ source, tutorialPopoverShown: false }))
    dispatch(
      checkConnectToInstanceAction(
        targetDatabaseId,
        connectToInstanceSuccess,
        () => {},
        false,
      ),
    )
  }

  return (
    <PrimaryButton
      size="m"
      disabled={loading}
      loading={loading}
      onClick={handleCheckConnectToInstance}
      className={cx(styles.btn, className)}
      data-testid="connect-free-db-btn"
    >
      Launch database
    </PrimaryButton>
  )
}

export default OAuthConnectFreeDb
