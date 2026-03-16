import React, { useCallback, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { IndexField } from '../../components/index-details/IndexDetails.types'
import { PickSampleDataModal } from '../../components/pick-sample-data-modal'
import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'
import { useCreateIndexFlow, useHasExistingKeys } from '../../hooks'
import { CreateIndexMode } from '../../pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'
import {
  SearchTelemetryCancelStep,
  SearchTelemetryDemoDataNextStep,
  SearchTelemetrySource,
} from '../../telemetry.constants'
import { getFieldTypeSummary } from '../../utils/telemetry.utils'
import { getFieldsBySampleData } from '../../utils/sampleData'
import { VectorSearchProviderProps } from './VectorSearchContext.types'
import { VectorSearchContext } from './VectorSearchContext'

export const VectorSearchProvider = ({
  children,
}: VectorSearchProviderProps) => {
  const [isSampleDataModalOpen, setIsSampleDataModalOpen] = useState(false)
  const [selectedDataset, setSelectedDataset] =
    useState<SampleDataContent | null>(null)

  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()

  const { run: createIndexFlow } = useCreateIndexFlow()
  const { hasKeys: hasExistingKeys, loading: hasExistingKeysLoading } =
    useHasExistingKeys()

  const openPickSampleDataModal = useCallback(
    (source: SearchTelemetrySource) => {
      setSelectedDataset(null)
      setIsSampleDataModalOpen(true)

      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_DEMO_ONBOARDING_TRIGGERED,
        eventData: { databaseId: instanceId, source },
      })
    },
    [instanceId],
  )

  const dismissSampleDataModal = useCallback(() => {
    setIsSampleDataModalOpen(false)
    setSelectedDataset(null)
  }, [])

  const cancelSampleDataModal = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_CREATE_INDEX_CANCELLED,
      eventData: {
        databaseId: instanceId,
        step: SearchTelemetryCancelStep.SampleDataModal,
      },
    })

    dismissSampleDataModal()
  }, [instanceId, dismissSampleDataModal])

  const handleSelectDataset = useCallback((value: SampleDataContent) => {
    setSelectedDataset(value)
  }, [])

  const handleSeeIndexDefinition = useCallback(
    (dataset: SampleDataContent) => {
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_DEMO_DATA_SELECTED,
        eventData: {
          databaseId: instanceId,
          dataset,
          next_step: SearchTelemetryDemoDataNextStep.IndexDefinition,
        },
      })

      dismissSampleDataModal()
      history.push({
        pathname: Pages.vectorSearchCreateIndex(instanceId),
        search: `?sampleData=${dataset}`,
      })
    },
    [dismissSampleDataModal, history, instanceId],
  )

  const onStartQueryingIndexCreated = useCallback(
    (fields: IndexField[]) => {
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_INDEX_CREATED,
        eventData: {
          databaseId: instanceId,
          data_source: CreateIndexMode.SampleData,
          number_of_indexed_fields: fields.length,
          field_types: getFieldTypeSummary(fields),
          fields_modified: false,
        },
      })
    },
    [instanceId],
  )

  const onStartQueryingIndexError = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_CREATE_INDEX_ERROR,
      eventData: {
        databaseId: instanceId,
        data_source: CreateIndexMode.SampleData,
      },
    })
  }, [instanceId])

  const handleStartQuerying = useCallback(
    (dataset: SampleDataContent) => {
      const fields = getFieldsBySampleData(dataset)

      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_DEMO_DATA_SELECTED,
        eventData: {
          databaseId: instanceId,
          dataset,
          next_step: SearchTelemetryDemoDataNextStep.StartQuerying,
        },
      })

      dismissSampleDataModal()
      createIndexFlow(instanceId, dataset, {
        onSuccess: () => onStartQueryingIndexCreated(fields),
        onError: onStartQueryingIndexError,
      })
    },
    [
      dismissSampleDataModal,
      createIndexFlow,
      instanceId,
      onStartQueryingIndexCreated,
      onStartQueryingIndexError,
    ],
  )

  const navigateToExistingDataFlow = useCallback(
    (source: SearchTelemetrySource) => {
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_OWN_DATA_INDEX_TRIGGERED,
        eventData: { databaseId: instanceId, source },
      })

      history.push({
        pathname: Pages.vectorSearchCreateIndex(instanceId),
        search: `?mode=${CreateIndexMode.ExistingData}`,
      })
    },
    [history, instanceId],
  )

  const contextValue = useMemo(
    () => ({
      openPickSampleDataModal,
      navigateToExistingDataFlow,
      hasExistingKeys,
      hasExistingKeysLoading,
    }),
    [
      openPickSampleDataModal,
      navigateToExistingDataFlow,
      hasExistingKeys,
      hasExistingKeysLoading,
    ],
  )

  return (
    <VectorSearchContext.Provider value={contextValue}>
      {children}
      <PickSampleDataModal
        isOpen={isSampleDataModalOpen}
        selectedDataset={selectedDataset}
        onSelectDataset={handleSelectDataset}
        onCancel={cancelSampleDataModal}
        onSeeIndexDefinition={handleSeeIndexDefinition}
        onStartQuerying={handleStartQuerying}
      />
    </VectorSearchContext.Provider>
  )
}
