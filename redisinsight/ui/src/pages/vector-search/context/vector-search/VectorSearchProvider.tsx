import React, { useCallback, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'

import { PickSampleDataModal } from '../../components/pick-sample-data-modal'
import { SampleDataContent } from '../../components/pick-sample-data-modal/PickSampleDataModal.types'
import { useCreateIndexFlow } from '../../hooks'

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

  // Only expose stable callbacks so child pages don't re-render on modal state changes
  const contextValue = useMemo(
    () => ({
      openPickSampleDataModal,
    }),
    [openPickSampleDataModal],
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
