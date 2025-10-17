import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { IError } from 'uiSrc/slices/interfaces'
import { DEFAULT_ERROR_MESSAGE } from 'uiSrc/utils'
import { riToast } from 'uiSrc/components/base/display/toast'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'
import errorMessages from 'uiSrc/components/notifications/error-messages'
import { CustomErrorCodes } from 'uiSrc/constants'
import { errorsSelector, removeMessage } from 'uiSrc/slices/app/notifications'

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

  useEffect(() => {
    showErrorsToasts(errorsData)
  }, [errorsData])
}
