import React, { createContext, useCallback, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { CreateIndexMode } from 'uiSrc/pages/vector-search/pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'

import { MakeSearchableModal } from './MakeSearchableModal'

export interface MakeSearchableModalConfig {
  prefix?: string
  initialKey?: RedisResponseBuffer
  initialKeyType?: RedisearchIndexKeyType
  initialPrefix?: string
}

const MakeSearchableModalContext = createContext<{
  openMakeSearchableModal: (config: MakeSearchableModalConfig) => void
} | null>(null)

export const useMakeSearchableModal = () => {
  const ctx = useContext(MakeSearchableModalContext)
  if (!ctx) {
    throw new Error(
      'useMakeSearchableModal must be used within MakeSearchableModalProvider',
    )
  }
  return ctx
}

export const MakeSearchableModalProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [config, setConfig] = useState<MakeSearchableModalConfig | null>(null)
  const history = useHistory()
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const openMakeSearchableModal = useCallback(
    (cfg: MakeSearchableModalConfig) => setConfig(cfg),
    [],
  )

  const handleConfirm = useCallback(() => {
    if (!config) return
    setConfig(null)
    history.push(Pages.vectorSearchCreateIndex(instanceId), {
      mode: CreateIndexMode.ExistingData,
      initialKey: config.initialKey,
      initialKeyType: config.initialKeyType,
      initialPrefix: config.initialPrefix,
    })
  }, [config, history, instanceId])

  return (
    <MakeSearchableModalContext.Provider value={{ openMakeSearchableModal }}>
      {children}
      <MakeSearchableModal
        isOpen={config !== null}
        prefix={config?.prefix}
        onConfirm={handleConfirm}
        onCancel={() => setConfig(null)}
      />
    </MakeSearchableModalContext.Provider>
  )
}
