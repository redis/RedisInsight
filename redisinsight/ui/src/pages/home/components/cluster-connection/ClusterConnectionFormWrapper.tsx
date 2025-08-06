import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { RiTitle } from 'uiBase/text'
import {
  clusterSelector,
  fetchInstancesRedisCluster,
} from 'uiSrc/slices/instances/cluster'
import { Pages } from 'uiSrc/constants'
import { resetErrors } from 'uiSrc/slices/app/notifications'
import { ICredentialsRedisCluster, InstanceType } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { autoFillFormDetails } from 'uiSrc/pages/home/utils'

import { useModalHeader } from 'uiSrc/contexts/ModalTitleProvider'
import ClusterConnectionForm from './cluster-connection-form/ClusterConnectionForm'

export interface Props {
  onClose?: () => void
}

const ClusterConnectionFormWrapper = ({ onClose }: Props) => {
  const [initialValues, setInitialValues] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
  })

  const history = useHistory()
  const dispatch = useDispatch()
  const { setModalHeader } = useModalHeader()

  const formRef = useRef<HTMLDivElement>(null)

  const { loading, credentials } = useSelector(clusterSelector)

  useEffect(() => {
    setModalHeader(<RiTitle size="M">Redis Software</RiTitle>, true)

    return () => {
      setModalHeader(null)
      dispatch(resetErrors())
    }
  }, [])

  useEffect(() => {
    if (credentials) {
      setInitialValues({
        host: credentials?.host,
        port: credentials?.port?.toString(),
        username: credentials?.username,
        password: credentials?.password,
      })
    }
  }, [credentials])

  const formSubmit = (values: ICredentialsRedisCluster) => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_RE_CLUSTER_AUTODISCOVERY_SUBMITTED,
    })

    dispatch(fetchInstancesRedisCluster(values, onSuccess))
  }

  const onSuccess = () => {
    history.push(Pages.redisEnterpriseAutodiscovery)
  }

  const handlePostHostName = (content: string) =>
    autoFillFormDetails(
      content,
      initialValues,
      setInitialValues,
      InstanceType.RedisEnterpriseCluster,
    )

  return (
    <div ref={formRef}>
      <ClusterConnectionForm
        host={credentials?.host ?? ''}
        port={credentials?.port?.toString() ?? ''}
        username={credentials?.username ?? ''}
        password={credentials?.password ?? ''}
        initialValues={initialValues}
        onHostNamePaste={handlePostHostName}
        onClose={onClose}
        onSubmit={formSubmit}
        loading={loading}
      />
    </div>
  )
}

export default ClusterConnectionFormWrapper
