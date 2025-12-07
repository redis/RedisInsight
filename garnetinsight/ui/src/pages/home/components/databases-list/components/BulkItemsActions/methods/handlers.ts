import { map } from 'lodash'
import saveAs from 'file-saver'

import { Instance } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  deleteInstancesAction,
  exportInstancesAction,
  setEditedInstance,
} from 'uiSrc/slices/instances/instances'
import { BrowserStorageItem } from 'uiSrc/constants'
import { dispatch } from 'uiSrc/slices/store'
import { localStorageService } from 'uiSrc/services'

const onDeleteInstances = (instances: Instance[]) => {
  dispatch(setEditedInstance(null))

  instances.forEach((instance) => {
    localStorageService.remove(BrowserStorageItem.dbConfig + instance.id)
  })
}

export const handleDeleteInstances = (instances: Instance[]) => {
  if (instances.length > 1) {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_MULTIPLE_DATABASES_DELETE_CLICKED,
      eventData: {
        ids: instances.map((instance) => instance.id),
      },
    })
  }

  dispatch(deleteInstancesAction(instances, () => onDeleteInstances(instances)))
}

export const handleExportInstances = (
  instances: Instance[],
  withSecrets: boolean,
) => {
  const ids = map(instances, 'id')

  sendEventTelemetry({
    event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_CLICKED,
  })

  dispatch(
    exportInstancesAction(
      ids,
      withSecrets,
      (data) => {
        const file = new Blob([JSON.stringify(data, null, 2)], {
          type: 'text/plain;charset=utf-8',
        })
        saveAs(file, `Garnetinsight_connections_${Date.now()}.json`)

        sendEventTelemetry({
          event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_SUCCEEDED,
          eventData: {
            numberOfDatabases: ids.length,
          },
        })
      },
      () => {
        sendEventTelemetry({
          event: TelemetryEvent.CONFIG_DATABASES_REDIS_EXPORT_FAILED,
          eventData: {
            numberOfDatabases: ids.length,
          },
        })
      },
    ),
  )
}
