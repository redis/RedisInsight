import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import {
  errorsSelector,
  infiniteNotificationsSelector,
  messagesSelector,
  removeInfiniteNotification,
  removeMessage,
} from 'uiSrc/slices/app/notifications'
import { setReleaseNotesViewed } from 'uiSrc/slices/app/info'
import { IError, IMessage, InfiniteMessage } from 'uiSrc/slices/interfaces'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'
import { showOAuthProgress } from 'uiSrc/slices/oauth/cloud'
import { CustomErrorCodes } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ColorText } from 'uiSrc/components/base/text'
import { riToast, RiToaster } from 'uiSrc/components/base/display/toast'

import errorMessages from './error-messages'
import { InfiniteMessagesIds } from './components'

import styles from './styles.module.scss'

const ONE_HOUR = 3_600_000
const DEFAULT_ERROR_TITLE = 'Error'

const Notifications = () => {
  const messagesData = useSelector(messagesSelector)
  const errorsData = useSelector(errorsSelector)
  const infiniteNotifications = useSelector(infiniteNotificationsSelector)

  const dispatch = useDispatch()
  const toastIdsRef = useRef(new Map())

  const removeToast = (id: string) => {
    if (toastIdsRef.current.has(id)) {
      riToast.dismiss(toastIdsRef.current.get(id))
      toastIdsRef.current.delete(id)
    }
    dispatch(removeMessage(id))
  }

  const onSubmitNotification = (id: string, group?: string) => {
    if (group === 'upgrade') {
      dispatch(setReleaseNotesViewed(true))
    }
    dispatch(removeMessage(id))
  }

  const getSuccessText = (text: string | JSX.Element | JSX.Element[]) => (
    <ColorText color="success">{text}</ColorText>
  )

  const showSuccessToasts = (data: IMessage[]) =>
    data.forEach(({ id = '', title = '', message = '', className, group }) => {
      const handleClose = () => {
        onSubmitNotification(id, group)
        removeToast(id)
      }
      if (toastIdsRef.current.has(id)) {
        removeToast(id)
        return
      }
      const toastId = riToast(
        {
          className,
          message: title,
          description: getSuccessText(message),
          actions: {
            primary: {
              closes: true,
              label: 'OK',
              onClick: handleClose,
            },
          },
        },
        { variant: riToast.Variant.Success, toastId: id },
      )
      toastIdsRef.current.set(id, toastId)
    })

  const showErrorsToasts = (errors: IError[]) =>
    errors.forEach(
      ({
        id = '',
        message = DEFAULT_ERROR_MESSAGE,
        instanceId = '',
        name,
        title = DEFAULT_ERROR_TITLE,
        additionalInfo,
      }) => {
        if (toastIdsRef.current.has(id)) {
          removeToast(id)
          return
        }
        let toastId: ReturnType<typeof riToast>
        if (ApiEncryptionErrors.includes(name)) {
          toastId = errorMessages.ENCRYPTION(
            () => removeToast(id),
            instanceId,
            id,
          )
        } else if (
          additionalInfo?.errorCode ===
          CustomErrorCodes.CloudCapiKeyUnauthorized
        ) {
          toastId = errorMessages.CLOUD_CAPI_KEY_UNAUTHORIZED(
            { message, title },
            additionalInfo,
            () => removeToast(id),
            id,
          )
        } else if (
          additionalInfo?.errorCode ===
          CustomErrorCodes.RdiDeployPipelineFailure
        ) {
          toastId = errorMessages.RDI_DEPLOY_PIPELINE(
            { title, message },
            () => removeToast(id),
            id,
          )
        } else {
          toastId = errorMessages.DEFAULT(
            message,
            () => removeToast(id),
            title,
            id,
          )
        }

        toastIdsRef.current.set(id, toastId)
      },
    )
  const infiniteToastIdsRef = useRef(new Set<number | string>())

  const showInfiniteToasts = (data: InfiniteMessage[]) => {
    infiniteToastIdsRef.current.forEach((toastId) => {
      setTimeout(() => {
        riToast.dismiss(toastId)
        infiniteToastIdsRef.current.delete(toastId)
      }, 50)
    })
    data.forEach((notification: InfiniteMessage) => {
      const {
        id,
        message,
        description,
        actions,
        className = '',
        variant,
        customIcon,
        showCloseButton = true,
        onClose: onCloseCallback,
      } = notification
      const toastId = riToast(
        {
          className: cx(styles.infiniteMessage, className),
          message: message,
          description: description,
          actions,
          showCloseButton,
          customIcon,
          onClose: () => {
            switch (id) {
              case InfiniteMessagesIds.oAuthProgress:
                dispatch(showOAuthProgress(false))
                break
              case InfiniteMessagesIds.databaseExists:
                sendEventTelemetry({
                  event:
                    TelemetryEvent.CLOUD_IMPORT_EXISTING_DATABASE_FORM_CLOSED,
                })
                break
              case InfiniteMessagesIds.subscriptionExists:
                sendEventTelemetry({
                  event:
                    TelemetryEvent.CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION_FORM_CLOSED,
                })
                break
              case InfiniteMessagesIds.appUpdateAvailable:
                sendEventTelemetry({
                  event: TelemetryEvent.UPDATE_NOTIFICATION_CLOSED,
                })
                break
              default:
                break
            }

            dispatch(removeInfiniteNotification(id))
            onCloseCallback?.()
          },
        },
        {
          variant: variant ?? riToast.Variant.Notice,
          autoClose: ONE_HOUR,
          toastId: id,
        },
      )
      infiniteToastIdsRef.current.add(toastId)
      toastIdsRef.current.set(id, toastId)
    })
  }

  useEffect(() => {
    showSuccessToasts(messagesData)
  }, [messagesData])
  useEffect(() => {
    showErrorsToasts(errorsData)
  }, [errorsData])
  useEffect(() => {
    showInfiniteToasts(infiniteNotifications)
  }, [infiniteNotifications])

  return <RiToaster />
}

export default Notifications
