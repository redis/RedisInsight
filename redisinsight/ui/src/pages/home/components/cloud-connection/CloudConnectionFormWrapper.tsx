import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import {
  cloudSelector,
  fetchSubscriptionsRedisCloud,
  setSSOFlow,
} from 'uiSrc/slices/instances/cloud'
import { resetErrors } from 'uiSrc/slices/app/notifications'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { useModalHeader } from 'uiSrc/contexts/ModalTitleProvider'
import { Title } from 'uiSrc/components/base/text/Title'
import CloudConnectionForm from './cloud-connection-form'

export interface Props {
  onClose?: () => void
}

export interface ICloudConnectionSubmit {
  accessKey: string
  secretKey: string
}

const CloudConnectionFormWrapper = ({ onClose }: Props) => {
  const dispatch = useAppDispatch()

  const history = useHistory()
  const { loading, credentials } = useAppSelector(cloudSelector)

  const { setModalHeader } = useModalHeader()

  useEffect(() => {
    setModalHeader(<Title size="M">Discover Cloud databases</Title>, true)

    return () => {
      setModalHeader(null)
      dispatch(resetErrors())
    }
  }, [])

  const formSubmit = (credentials: ICloudConnectionSubmit) => {
    sendEventTelemetry({
      event:
        TelemetryEvent.CONFIG_DATABASES_REDIS_CLOUD_AUTODISCOVERY_SUBMITTED,
    })
    dispatch(setSSOFlow(undefined))
    dispatch(fetchSubscriptionsRedisCloud(credentials, false, onSuccess))
  }

  const onSuccess = () => {
    history.push(Pages.redisCloudSubscriptions)
  }

  return (
    <CloudConnectionForm
      accessKey={credentials?.accessKey ?? ''}
      secretKey={credentials?.secretKey ?? ''}
      onClose={onClose}
      onSubmit={formSubmit}
      loading={loading}
    />
  )
}

export default CloudConnectionFormWrapper
