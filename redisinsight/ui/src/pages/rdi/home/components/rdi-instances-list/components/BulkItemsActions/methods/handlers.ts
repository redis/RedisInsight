import { RdiInstance } from 'uiSrc/slices/interfaces'
import { dispatch } from 'uiSrc/slices/store'
import { deleteInstancesAction } from 'uiSrc/slices/rdi/instances'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'

export const handleDeleteInstances = (items: RdiInstance[]) => {
  sendEventTelemetry({
    event: TelemetryEvent.RDI_INSTANCE_MULTIPLE_DELETE_CLICKED,
    eventData: { ids: items.map((i) => i.id) },
  })
  dispatch(deleteInstancesAction(items))
}
