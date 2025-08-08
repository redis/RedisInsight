import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { CreateSearchIndexParameters } from './create-index/types'

interface CollectTelemetry {
  instanceId: string
}

export const collectSavedQueriesPanelToggleTelemetry = ({
  instanceId,
  isSavedQueriesOpen,
}: CollectTelemetry & {
  isSavedQueriesOpen: boolean
}): void => {
  sendEventTelemetry({
    event: isSavedQueriesOpen
      ? TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_CLOSED
      : TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_OPENED,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectChangedSavedQueryIndexTelemetry = ({
  instanceId,
}: CollectTelemetry): void => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_SAVED_QUERIES_INDEX_CHANGED,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectInsertSavedQueryTelemetry = ({
  instanceId,
}: CollectTelemetry): void => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_SAVED_QUERIES_INSERT_CLICKED,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectCreateIndexWizardTelemetry = ({
  instanceId,
  step,
  parameters,
}: CollectTelemetry & {
  step: number
  parameters: CreateSearchIndexParameters
}): void => {
  switch (step) {
    case 1:
      collectStartStepTelemetry(instanceId)
      break
    case 2:
      collectIndexInfoStepTelemetry(instanceId, parameters)
      break
    case 3:
      collectCreateIndexStepTelemetry(instanceId)
      break
    default:
      // No telemetry for other steps
      break
  }
}

export const collectStartStepTelemetry = (instanceId: string): void => {
  sendEventTelemetry({
    event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_TRIGGERED,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectIndexInfoStepTelemetry = (
  instanceId: string,
  parameters: CreateSearchIndexParameters,
): void => {
  sendEventTelemetry({
    event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_PROCEED_TO_INDEX_INFO,
    eventData: {
      databaseId: instanceId,
      indexType: parameters.searchIndexType,
      sampleDataType: parameters.sampleDataType,
      dataContent: parameters.dataContent,
    },
  })
}

export const collectCreateIndexStepTelemetry = (instanceId: string): void => {
  sendEventTelemetry({
    event: TelemetryEvent.VECTOR_SEARCH_ONBOARDING_PROCEED_TO_QUERIES,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectManageIndexesDrawerOpenedTelemetry = ({
  instanceId,
}: CollectTelemetry): void => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_OPENED,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectManageIndexesDrawerClosedTelemetry = ({
  instanceId,
}: CollectTelemetry): void => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_MANAGE_INDEXES_DRAWER_CLOSED,
    eventData: {
      databaseId: instanceId,
    },
  })
}
