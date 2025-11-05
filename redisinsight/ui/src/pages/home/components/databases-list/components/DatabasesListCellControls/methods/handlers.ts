import { Instance } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  deleteInstancesAction,
  fetchEditedInstanceAction,
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

export const handleDeleteInstances = (instances: Instance) => {
  dispatch(
    deleteInstancesAction([instances], () => onDeleteInstances([instances])),
  )
}

export const handleClickDeleteInstance = ({ id, provider }: Instance) => {
  sendEventTelemetry({
    event: TelemetryEvent.CONFIG_DATABASES_SINGLE_DATABASE_DELETE_CLICKED,
    eventData: {
      databaseId: id,
      provider,
    },
  })
}

export const handleClickGoToCloud = () => {
  sendEventTelemetry({
    event: TelemetryEvent.CLOUD_LINK_CLICKED,
  })
}

export const handleClickEditInstance = (instance: Instance) => {
  sendEventTelemetry({
    event: TelemetryEvent.CONFIG_DATABASES_DATABASE_EDIT_CLICKED,
    eventData: {
      databaseId: instance.id,
      provider: instance.provider,
    },
  })

  if (instance) {
    dispatch(fetchEditedInstanceAction(instance))
  }
}

export const handleManageInstanceTags = (instance: Instance) => {
  sendEventTelemetry({
    event: TelemetryEvent.CONFIG_DATABASES_DATABASE_MANAGE_TAGS_CLICKED,
    eventData: {
      databaseId: instance.id,
      provider: instance.provider,
    },
  })
  dispatch(setEditedInstance(instance))
}
