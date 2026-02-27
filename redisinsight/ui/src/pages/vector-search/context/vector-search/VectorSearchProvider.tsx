import React, { useCallback, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'

import { PickSampleDataModal } from '../../components/pick-sample-data-modal'
import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'
import { useCreateIndexFlow, useHasExistingKeys } from '../../hooks'
import { CreateIndexMode } from '../../pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'

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

  const openPickSampleDataModal = useCallback(() => {
    setSelectedDataset(null)
    setIsSampleDataModalOpen(true)
  }, [])

  const closeSampleDataModal = useCallback(() => {
    setIsSampleDataModalOpen(false)
    setSelectedDataset(null)
  }, [])

  const handleSelectDataset = useCallback((value: SampleDataContent) => {
    setSelectedDataset(value)
  }, [])

  const handleSeeIndexDefinition = useCallback(
    (dataset: SampleDataContent) => {
      closeSampleDataModal()
      history.push({
        pathname: Pages.vectorSearchCreateIndex(instanceId),
        state: { sampleData: dataset },
      })
    },
    [closeSampleDataModal, history, instanceId],
  )

  const handleStartQuerying = useCallback(
    (dataset: SampleDataContent) => {
      closeSampleDataModal()
      createIndexFlow(instanceId, dataset)
    },
    [closeSampleDataModal, createIndexFlow, instanceId],
  )

  const navigateToExistingDataFlow = useCallback(() => {
    history.push({
      pathname: Pages.vectorSearchCreateIndex(instanceId),
      state: { mode: CreateIndexMode.ExistingData },
    })
  }, [history, instanceId])

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
        onCancel={closeSampleDataModal}
        onSeeIndexDefinition={handleSeeIndexDefinition}
        onStartQuerying={handleStartQuerying}
      />
    </VectorSearchContext.Provider>
  )
}
