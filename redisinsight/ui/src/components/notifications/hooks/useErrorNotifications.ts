import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { IError } from 'uiSrc/slices/interfaces'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'
import { riToast } from 'uiSrc/components/base/display/toast'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'
import errorMessages from 'uiSrc/components/notifications/error-messages'
import { CustomErrorCodes } from 'uiSrc/constants'
import { errorsSelector, removeMessage } from 'uiSrc/slices/app/notifications'
import { defaultContainerId } from 'uiSrc/components/notifications/constants'
import { RiToastType } from 'uiSrc/components/base/display/toast/RiToast'

const DEFAULT_ERROR_TITLE = 'Error'

export const useErrorNotifications = () => {
  const errorsData = useSelector(errorsSelector)
  const dispatch = useDispatch()
  const toastIdsRef = useRef(new Map<string, number | string>())
  const removeToast = (id: string) => {
    if (toastIdsRef.current.has(id)) {
      riToast.dismiss(toastIdsRef.current.get(id))
      toastIdsRef.current.delete(id)
    }
    dispatch(removeMessage(id))
  }
  const showErrorsToasts = (errors: IError[]) =>
    errors.forEach(
      ({
        id = '',
        message = DEFAULT_ERROR_MESSAGE,
        instanceId = '',
        name,
        title = DEFAULT_ERROR_TITLE,
        additionalInfo,
        persistent,
      }) => {
        if (toastIdsRef.current.has(id)) {
          removeToast(id)
          return
        }

        let errorMessage: RiToastType
        if (ApiEncryptionErrors.includes(name)) {
          errorMessage = errorMessages.ENCRYPTION(
            () => removeToast(id),
            instanceId,
          )
        } else if (
          additionalInfo?.errorCode ===
          CustomErrorCodes.CloudCapiKeyUnauthorized
        ) {
          errorMessage = errorMessages.CLOUD_CAPI_KEY_UNAUTHORIZED(
            { message, title },
            additionalInfo,
            () => removeToast(id),
          )
        } else if (
          additionalInfo?.errorCode ===
          CustomErrorCodes.RdiDeployPipelineFailure
        ) {
          errorMessage = errorMessages.RDI_DEPLOY_PIPELINE(
            { title, message },
            () => removeToast(id),
          )
        } else if (
          additionalInfo?.errorCode ===
          CustomErrorCodes.AzureEntraIdTokenExpired
        ) {
          errorMessage = errorMessages.AZURE_TOKEN_EXPIRED(
            { message, title },
            () => removeToast(id),
          )
        } else if (persistent) {
          errorMessage = errorMessages.PERSISTENT({ message, title }, () =>
            removeToast(id),
          )
        } else {
          errorMessage = errorMessages.DEFAULT(
            message,
            () => removeToast(id),
            title,
          )
        }
        const toastId: ReturnType<typeof riToast> = riToast(errorMessage, {
          variant: riToast.Variant.Danger,
          toastId: id,
          containerId: defaultContainerId,
          autoClose: persistent ? false : undefined,
        })
        toastIdsRef.current.set(id, toastId)
      },
    )

  useEffect(() => {
    showErrorsToasts(errorsData)
  }, [errorsData])
}
