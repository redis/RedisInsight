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
import { RiColorText } from 'uiSrc/components/base/text'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { riToast, RiToaster } from 'uiSrc/components/base/display'

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
    <RiColorText color="success">{text}</RiColorText>
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
          customIcon: InfoIcon,
          actions: {
            primary: {
              closes: true,
              label: 'Ok',
              onClick: handleClose,
            },
          },
        },
        { variant: riToast.Variant.Success },
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
          toastId = errorMessages.ENCRYPTION(() => removeToast(id), instanceId)
        } else if (
          additionalInfo?.errorCode ===
          CustomErrorCodes.CloudCapiKeyUnauthorized
        ) {
          toastId = errorMessages.CLOUD_CAPI_KEY_UNAUTHORIZED(
            { message, title },
            additionalInfo,
            () => removeToast(id),
          )
        } else if (
          additionalInfo?.errorCode ===
          CustomErrorCodes.RdiDeployPipelineFailure
        ) {
          toastId = errorMessages.RDI_DEPLOY_PIPELINE({ title, message }, () =>
            removeToast(id),
          )
        } else {
          toastId = errorMessages.DEFAULT(message, () => removeToast(id), title)
        }

        toastIdsRef.current.set(id, toastId)
      },
    )

  const showInfiniteToasts = (data: InfiniteMessage[]) =>
    data.forEach((message: InfiniteMessage) => {
      const { id, Inner, className = '' } = message
      if (toastIdsRef.current.has(id)) {
        removeToast(id)
        dispatch(removeInfiniteNotification(id))
        return
      }
      const toastId = riToast(
        {
          className: cx(styles.infiniteMessage, className),
          description: Inner,
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
          },
        },
        { variant: riToast.Variant.Notice, autoClose: ONE_HOUR },
      )
      toastIdsRef.current.set(id, toastId)
    })

  useEffect(() => {
    showSuccessToasts(messagesData)
    showErrorsToasts(errorsData)
    showInfiniteToasts(infiniteNotifications)
  }, [messagesData, errorsData, infiniteNotifications])

  return <RiToaster />
}

export default Notifications
