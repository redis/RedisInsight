import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import BrowserStorageItem from 'uiSrc/constants/storage'
import { localStorageService } from 'uiSrc/services'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { bufferToString } from 'uiSrc/utils'

import { ValueDecoderModal, ValueDecoderModalConfig } from './ValueDecoderModal'
import { normalizeRule } from './schemaUtils'
import { ValueDecoderRule } from './types'
import { findMatchingDecoderRule } from './utils'

export interface ValueDecoderContextValue {
  decoders: ValueDecoderRule[]
  matchedRule: ValueDecoderRule | null
  isDecodeEnabled: boolean
  hasMatchingRule: boolean
  openValueDecoderModal: () => void
  toggleDecodeEnabled: () => void
  setDecodeEnabled: (enabled: boolean) => void
}

const ValueDecoderContext = createContext<ValueDecoderContextValue | null>(null)

const NOOP_CONTEXT: ValueDecoderContextValue = {
  decoders: [],
  matchedRule: null,
  isDecodeEnabled: false,
  hasMatchingRule: false,
  openValueDecoderModal: () => {},
  toggleDecodeEnabled: () => {},
  setDecodeEnabled: () => {},
}

const loadDecoders = (): ValueDecoderRule[] => {
  const raw: ValueDecoderRule[] =
    localStorageService?.get(BrowserStorageItem.valueDecoderRules) ?? []
  return raw.map(normalizeRule)
}

const saveDecoders = (decoders: ValueDecoderRule[]) => {
  localStorageService?.set(BrowserStorageItem.valueDecoderRules, decoders)
}

export const useValueDecoder = () => {
  const ctx = useContext(ValueDecoderContext)
  return ctx ?? NOOP_CONTEXT
}

export const ValueDecoderProvider = ({
  children,
  keyProp,
}: {
  children: React.ReactNode
  keyProp: RedisResponseBuffer | null
}) => {
  const [decoders, setDecoders] = useState<ValueDecoderRule[]>(loadDecoders)
  const [modalConfig, setModalConfig] =
    useState<ValueDecoderModalConfig | null>(null)
  const [isDecodeEnabled, setIsDecodeEnabled] = useState(false)

  const keyName = keyProp ? bufferToString(keyProp) : ''
  const matchedRule = useMemo(
    () => (keyName ? findMatchingDecoderRule(decoders, keyName) : null),
    [decoders, keyName],
  )

  useEffect(() => {
    setIsDecodeEnabled(false)
  }, [keyName])

  const openValueDecoderModal = useCallback(() => {
    setModalConfig({ keyName })
  }, [keyName])

  const handleSaveDecoders = useCallback((nextDecoders: ValueDecoderRule[]) => {
    const normalized = nextDecoders.map(normalizeRule)
    setDecoders(normalized)
    saveDecoders(normalized)
    setModalConfig(null)
  }, [])

  const handleCancelModal = useCallback(() => {
    setModalConfig(null)
  }, [])

  const toggleDecodeEnabled = useCallback(() => {
    setIsDecodeEnabled((current) => !current)
  }, [])

  const contextValue = useMemo(
    () => ({
      decoders,
      matchedRule,
      isDecodeEnabled,
      hasMatchingRule: matchedRule !== null,
      openValueDecoderModal,
      toggleDecodeEnabled,
      setDecodeEnabled: setIsDecodeEnabled,
    }),
    [
      decoders,
      isDecodeEnabled,
      matchedRule,
      openValueDecoderModal,
      toggleDecodeEnabled,
    ],
  )

  return (
    <ValueDecoderContext.Provider value={contextValue}>
      {children}
      <ValueDecoderModal
        isOpen={modalConfig !== null}
        decoders={decoders}
        config={modalConfig}
        onSave={handleSaveDecoders}
        onCancel={handleCancelModal}
      />
    </ValueDecoderContext.Provider>
  )
}
