import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Socket } from 'socket.io-client'

import { SocketEvent } from 'uiSrc/constants'
import { PubSubEvent } from 'uiSrc/constants/pubSub'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { PubSubSubscription } from 'uiSrc/slices/interfaces/pubsub'
import {
  concatPubSubMessages,
  disconnectPubSub,
  pubSubSelector,
  setIsPubSubSubscribed,
  setIsPubSubUnSubscribed,
  setLoading,
  setPubSubConnected,
} from 'uiSrc/slices/pubsub/pubsub'
import { getSocketApiUrl, Nullable } from 'uiSrc/utils'
import { appCsrfSelector } from 'uiSrc/slices/app/csrf'
import { useIoConnection } from 'uiSrc/services/hooks/useIoConnection'

interface IProps {
  retryDelay?: number
}

const PubSubConfig = ({ retryDelay = 5000 }: IProps) => {
  const { id: instanceId = '' } = useSelector(connectedInstanceSelector)
  const { isSubscribeTriggered, isConnected, subscriptions } =
    useSelector(pubSubSelector)
  const { token } = useSelector(appCsrfSelector)
  const socketRef = useRef<Nullable<Socket>>(null)
  const connectIo = useIoConnection(getSocketApiUrl('pub-sub'), {
    token,
    query: { instanceId },
  })

  const dispatch = useDispatch()

  useEffect(() => {
    if (!isSubscribeTriggered || !instanceId || socketRef.current?.connected) {
      return
    }
    let retryTimer: NodeJS.Timer

    socketRef.current = connectIo()

    socketRef.current.on(SocketEvent.Connect, () => {
      clearTimeout(retryTimer)
      dispatch(setPubSubConnected(true))
      subscribeForChannels()
    })

    // Catch connect error
    socketRef.current?.on(SocketEvent.ConnectionError, () => {})

    // Catch exceptions
    socketRef.current?.on(PubSubEvent.Exception, () => {
      handleDisconnect()
    })

    // Catch disconnect
    socketRef.current?.on(SocketEvent.Disconnect, () => {
      if (retryDelay) {
        retryTimer = setTimeout(handleDisconnect, retryDelay)
      } else {
        handleDisconnect()
      }
    })
  }, [instanceId, isSubscribeTriggered])

  useEffect(() => {
    if (!socketRef.current?.connected) {
      return
    }

    if (!isSubscribeTriggered) {
      unSubscribeFromChannels()
      return
    }

    subscribeForChannels()
  }, [isSubscribeTriggered])

  const subscribeForChannels = () => {
    dispatch(setLoading(true))
    socketRef.current?.emit(
      PubSubEvent.Subscribe,
      { subscriptions },
      onChannelsSubscribe,
    )
  }

  const unSubscribeFromChannels = () => {
    dispatch(setLoading(true))
    socketRef.current?.emit(
      PubSubEvent.Unsubscribe,
      { subscriptions },
      onChannelsUnSubscribe,
    )
  }

  const onChannelsSubscribe = () => {
    dispatch(setLoading(false))
    dispatch(setIsPubSubSubscribed())
    subscriptions.forEach(({ channel, type }: PubSubSubscription) => {
      const subscription = `${type}:${channel}`
      const isListenerExist =
        !!socketRef.current?.listeners(subscription).length

      if (!isListenerExist) {
        socketRef.current?.on(subscription, (data) => {
          dispatch(concatPubSubMessages(data))
        })
      }
    })
  }

  const onChannelsUnSubscribe = () => {
    dispatch(setIsPubSubUnSubscribed())
    dispatch(setLoading(false))

    subscriptions.forEach(({ channel, type }: PubSubSubscription) => {
      socketRef.current?.removeListener(`${type}:${channel}`)
    })
  }

  useEffect(() => {
    if (!isConnected && socketRef.current?.connected) {
      handleDisconnect()
    }
  }, [isConnected])

  const handleDisconnect = () => {
    dispatch(disconnectPubSub())
    socketRef.current?.removeAllListeners()
    socketRef.current?.disconnect()
  }

  return null
}

export default PubSubConfig
