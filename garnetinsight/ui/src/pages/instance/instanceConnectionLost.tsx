import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { appConnectivity, retryConnection } from 'uiSrc/slices/app/connectivity'
import ConnectivityError from 'uiSrc/components/connectivity-error/ConnectivityError'

const InstanceConnectionLost = () => {
  const dispatch = useDispatch()
  const { instanceId: connectionInstanceId } = useParams<{
    instanceId: string
  }>()
  const { error, loading: isLoading } = useSelector(appConnectivity)

  const onRetry = () => {
    dispatch(retryConnection(connectionInstanceId))
  }

  return (
    <ConnectivityError isLoading={isLoading} error={error} onRetry={onRetry} />
  )
}

export default InstanceConnectionLost
