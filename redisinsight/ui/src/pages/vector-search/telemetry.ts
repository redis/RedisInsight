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

export const collectManageIndexesDetailsToggleTelemetry = ({
  instanceId,
  isOpen,
}: CollectTelemetry & {
  isOpen: boolean
}): void => {
  sendEventTelemetry({
    event: isOpen
      ? TelemetryEvent.SEARCH_MANAGE_INDEX_DETAILS_OPENED
      : TelemetryEvent.SEARCH_MANAGE_INDEX_DETAILS_CLOSED,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectManageIndexesDeleteTelemetry = ({
  instanceId,
}: CollectTelemetry): void => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_MANAGE_INDEX_DELETED,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectTelemetryQueryRun = ({
  instanceId,
  query,
}: CollectTelemetry & { query: string }) => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_COMMAND_SUBMITTED,
    eventData: {
      databaseId: instanceId,
      commands: [query],
    },
  })
}

export const collectTelemetryQueryReRun = ({
  instanceId,
  query,
}: CollectTelemetry & { query: string }) => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_COMMAND_RUN_AGAIN,
    eventData: {
      databaseId: instanceId,
      commands: [query],
    },
  })
}

export const collectTelemetryQueryClearAll = ({
  instanceId,
}: CollectTelemetry) => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_CLEAR_ALL_RESULTS_CLICKED,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectTelemetryQueryClear = ({
  instanceId,
}: CollectTelemetry) => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_CLEAR_EDITOR_CLICKED,
    eventData: {
      databaseId: instanceId,
    },
  })
}

export const collectQueryToggleFullScreenTelemetry = ({
  instanceId,
  isFullScreen,
}: CollectTelemetry & { isFullScreen: boolean }) => {
  sendEventTelemetry({
    event: TelemetryEvent.SEARCH_RESULTS_IN_FULL_SCREEN,
    eventData: {
      databaseId: instanceId,
      state: isFullScreen ? 'Open' : 'Close',
    },
  })
}
