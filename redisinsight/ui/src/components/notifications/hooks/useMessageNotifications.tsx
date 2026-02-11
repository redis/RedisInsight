import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ToastVariant } from '@redis-ui/components'
import { riToast } from 'uiSrc/components/base/display/toast'
import { messagesSelector, removeMessage } from 'uiSrc/slices/app/notifications'
import { IMessage } from 'uiSrc/slices/interfaces'
import { setReleaseNotesViewed } from 'uiSrc/slices/app/info'
import { ColorText } from 'uiSrc/components/base/text'
import { defaultContainerId } from '../constants'

const getDescriptionText = (
  text: string | JSX.Element | JSX.Element[],
  variant: ToastVariant = 'success',
) => <ColorText color={variant}>{text}</ColorText>

export const useMessageNotifications = () => {
  const messagesData = useSelector(messagesSelector)

  const dispatch = useDispatch()
  const toastIdsRef = useRef(new Map<string, number | string>())
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

  const showToasts = (data: IMessage[]) =>
    data.forEach(
      ({
        id = '',
        title = '',
        message = '',
        variant,
        showCloseButton = true,
        actions,
        className,
        group,
      }) => {
        const handleClose = () => {
          onSubmitNotification(id, group)
          removeToast(id)
        }
        if (toastIdsRef.current.has(id)) {
          removeToast(id)
          return
        }

        const toastVariant = variant ?? riToast.Variant.Success
        const toastId = riToast(
          {
            className,
            message: title,
            description: getDescriptionText(message, toastVariant),
            actions: actions ?? {
              primary: {
                closes: true,
                label: 'OK',
                onClick: handleClose,
              },
            },
            showCloseButton,
          },
          {
            variant: toastVariant,
            toastId: id,
            containerId: defaultContainerId,
          },
        )
        toastIdsRef.current.set(id, toastId)
      },
    )

  useEffect(() => {
    showToasts(messagesData)
  }, [messagesData])
}
