import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import { RiTitle } from 'uiSrc/components/base/text'
import CloudConnectionForm from './cloud-connection-form'

export interface Props {
  onClose?: () => void
}

export interface ICloudConnectionSubmit {
  accessKey: string
  secretKey: string
}

const CloudConnectionFormWrapper = ({ onClose }: Props) => {
  const dispatch = useDispatch()

  const history = useHistory()
  const { loading, credentials } = useSelector(cloudSelector)

  const { setModalHeader } = useModalHeader()

  useEffect(() => {
    setModalHeader(<RiTitle size="M">Discover Cloud databases</RiTitle>, true)

    return () => {
      setModalHeader(null)
      dispatch(resetErrors())
    }
  }, [])

  const formSubmit = (credentials: ICloudConnectionSubmit) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_SUBMITTED,
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
