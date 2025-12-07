import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { riToast } from 'uiSrc/components/base/display/toast'
import { messagesSelector, removeMessage } from 'uiSrc/slices/app/notifications'
import { IMessage } from 'uiSrc/slices/interfaces'
import { setReleaseNotesViewed } from 'uiSrc/slices/app/info'
import { ColorText } from 'uiSrc/components/base/text'
import { defaultContainerId } from '../constants'

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

  const getSuccessText = (text: string | JSX.Element | JSX.Element[]) => (
    <ColorText color="success">{text}</ColorText>
  )
  const showSuccessToasts = (data: IMessage[]) =>
    data.forEach(
      ({
        id = '',
        title = '',
        message = '',
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
        const toastId = riToast(
          {
            className,
            message: title,
            description: getSuccessText(message),
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
            variant: riToast.Variant.Success,
            toastId: id,
            containerId: defaultContainerId,
          },
        )
        toastIdsRef.current.set(id, toastId)
      },
    )

  useEffect(() => {
    showSuccessToasts(messagesData)
  }, [messagesData])
}
