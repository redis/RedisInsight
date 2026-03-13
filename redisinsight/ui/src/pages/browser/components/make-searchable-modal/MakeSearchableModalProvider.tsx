import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { bufferToString } from 'uiSrc/utils'
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

const NOOP_CONTEXT = {
  openMakeSearchableModal: () => {},
}

export const useMakeSearchableModal = () => {
  const ctx = useContext(MakeSearchableModalContext)
  return ctx ?? NOOP_CONTEXT
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
    const search = new URLSearchParams()
    search.set('mode', CreateIndexMode.ExistingData)
    if (config.initialKey)
      search.set('initialKey', bufferToString(config.initialKey))
    if (config.initialKeyType)
      search.set('initialKeyType', config.initialKeyType)
    if (config.initialPrefix) search.set('initialPrefix', config.initialPrefix)
    history.push({
      pathname: Pages.vectorSearchCreateIndex(instanceId),
      search: search.toString(),
    })
  }, [config, history, instanceId])

  const contextValue = useMemo(
    () => ({ openMakeSearchableModal }),
    [openMakeSearchableModal],
  )

  return (
    <MakeSearchableModalContext.Provider value={contextValue}>
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
