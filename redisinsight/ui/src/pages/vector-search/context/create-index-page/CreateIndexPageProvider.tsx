import React, { useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'

import { useCreateIndexCommand, useCreateIndexFlow } from '../../hooks'
import {
  getFieldsBySampleData,
  getDisplayNameBySampleData,
  getIndexPrefixBySampleData,
} from '../../utils/sampleData'
import { CreateIndexTab } from '../../pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'

import { CreateIndexPageProviderProps } from './CreateIndexPageContext.types'
import { CreateIndexPageContext } from './CreateIndexPageContext'

export const CreateIndexPageProvider = ({
  instanceId,
  sampleData,
  children,
}: CreateIndexPageProviderProps) => {
  const [activeTab, setActiveTab] = useState<CreateIndexTab>(
    CreateIndexTab.Table,
  )
  const [isReadonly] = useState(true)

  const history = useHistory()

  const { command } = useCreateIndexCommand(sampleData)
  const { run: createIndexFlow, loading } = useCreateIndexFlow()

  const fields = useMemo(() => getFieldsBySampleData(sampleData), [sampleData])
  const displayName = useMemo(
    () => getDisplayNameBySampleData(sampleData),
    [sampleData],
  )
  const indexPrefix = useMemo(
    () => getIndexPrefixBySampleData(sampleData),
    [sampleData],
  )

  const handleCreateIndex = useCallback(() => {
    createIndexFlow(instanceId, sampleData)
  }, [createIndexFlow, instanceId, sampleData])

  const handleCancel = useCallback(() => {
    history.push(Pages.vectorSearch(instanceId))
  }, [history, instanceId])

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      isReadonly,
      displayName,
      indexPrefix,
      fields,
      command,
      loading,
      handleCreateIndex,
      handleCancel,
    }),
    [
      activeTab,
      isReadonly,
      displayName,
      indexPrefix,
      fields,
      command,
      loading,
      handleCreateIndex,
      handleCancel,
    ],
  )

  return (
    <CreateIndexPageContext.Provider value={value}>
      {children}
    </CreateIndexPageContext.Provider>
  )
}
