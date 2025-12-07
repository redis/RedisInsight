import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { get } from 'lodash'

import {
  CloudJobStatus,
  CloudJobName,
  CloudJobStep,
} from 'uiSrc/electron/constants'
import { fetchInstancesAction } from 'uiSrc/slices/instances/instances'
import {
  createFreeDbJob,
  createFreeDbSuccess,
  logoutUserAction,
  oauthCloudJobSelector,
  oauthCloudSelector,
  setJob,
  setSocialDialogState,
} from 'uiSrc/slices/oauth/cloud'
import { CloudImportDatabaseResources } from 'uiSrc/slices/interfaces/cloud'
import {
  addErrorNotification,
  addInfiniteNotification,
  removeInfiniteNotification,
} from 'uiSrc/slices/app/notifications'
import { parseCustomError } from 'uiSrc/utils'
import {
  INFINITE_MESSAGES,
  InfiniteMessagesIds,
} from 'uiSrc/components/notifications/components'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import {
  ApiStatusCode,
  BrowserStorageItem,
  CustomErrorCodes,
} from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'

const OAuthJobs = () => {
  const {
    status,
    name: jobName,
    error,
    step,
    result,
  } = useSelector(oauthCloudJobSelector) ?? {}
  const { showProgress } = useSelector(oauthCloudSelector)

  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    switch (status) {
      case CloudJobStatus.Running:
        if (!showProgress) return

        dispatch(
          addInfiniteNotification(
            INFINITE_MESSAGES.PENDING_CREATE_DB(step as CloudJobStep),
          ),
        )
        break

      case CloudJobStatus.Finished:
        dispatch(
          fetchInstancesAction(() =>
            dispatch(createFreeDbSuccess(result, history, jobName)),
          ),
        )
        dispatch(
          setJob({
            id: '',
            name: CloudJobName.CreateFreeSubscriptionAndDatabase,
            status: '',
          }),
        )
        localStorageService.remove(BrowserStorageItem.OAuthJobId)
        break

      case CloudJobStatus.Failed:
        const errorCode = get(error, 'errorCode', 0) as CustomErrorCodes
        const subscriptionId = get(error, 'resource.subscriptionId', 0)
        const resources = get(
          error,
          'resource',
          {},
        ) as CloudImportDatabaseResources
        const statusCode = get(error, 'statusCode', 0) as number

        if (statusCode === ApiStatusCode.Unauthorized) {
          dispatch(logoutUserAction())
        }

        // eslint-disable-next-line sonarjs/no-nested-switch
        switch (errorCode) {
          case CustomErrorCodes.CloudDatabaseAlreadyExistsFree:
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.DATABASE_EXISTS(
                  () => importDatabase(resources),
                  closeImportDatabase,
                ),
              ),
            )

            break

          case CustomErrorCodes.CloudDatabaseImportForbidden:
            sendEventTelemetry({
              event: TelemetryEvent.CLOUD_IMPORT_DATABASE_FORBIDDEN,
            })

            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.DATABASE_IMPORT_FORBIDDEN(
                  closeDatabaseImportForbidden,
                ),
              ),
            )

            break

          case CustomErrorCodes.CloudSubscriptionAlreadyExistsFree:
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(
                  () => createFreeDatabase(subscriptionId),
                  closeCreateFreeDatabase,
                ),
              ),
            )
            break

          default:
            const err = parseCustomError(error || '')
            dispatch(addErrorNotification(err))
            break
        }

        dispatch(setSSOFlow())
        dispatch(setSocialDialogState(null))
        dispatch(removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress))
        break

      default:
        break
    }
  }, [status, error, step, result, showProgress])

  const importDatabase = (resources: CloudImportDatabaseResources) => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_IMPORT_EXISTING_DATABASE,
    })
    dispatch(
      createFreeDbJob({
        name: CloudJobName.ImportFreeDatabase,
        resources,
        onSuccessAction: () => {
          dispatch(
            removeInfiniteNotification(InfiniteMessagesIds.databaseExists),
          )
          dispatch(
            addInfiniteNotification(
              INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
            ),
          )
        },
      }),
    )
  }

  const createFreeDatabase = (subscriptionId: number) => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION,
    })
    dispatch(
      createFreeDbJob({
        name: CloudJobName.CreateFreeDatabase,
        resources: { subscriptionId },
        onSuccessAction: () => {
          dispatch(
            removeInfiniteNotification(InfiniteMessagesIds.subscriptionExists),
          )
          dispatch(
            addInfiniteNotification(
              INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
            ),
          )
        },
      }),
    )
  }

  const closeDatabaseImportForbidden = () => {
    dispatch(setSSOFlow())
    dispatch(
      removeInfiniteNotification(InfiniteMessagesIds.databaseImportForbidden),
    )
  }

  const closeImportDatabase = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_IMPORT_EXISTING_DATABASE_FORM_CLOSED,
    })
    dispatch(setSSOFlow())
    dispatch(removeInfiniteNotification(InfiniteMessagesIds.databaseExists))
  }

  const closeCreateFreeDatabase = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_CREATE_DATABASE_IN_SUBSCRIPTION_FORM_CLOSED,
    })
    dispatch(setSSOFlow())
    dispatch(removeInfiniteNotification(InfiniteMessagesIds.subscriptionExists))
  }

  return null
}

export default OAuthJobs
