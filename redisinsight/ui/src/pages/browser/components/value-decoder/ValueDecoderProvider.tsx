import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { bufferToString } from 'uiSrc/utils'

import { ValueDecoderModal, ValueDecoderModalConfig } from './ValueDecoderModal'
import { normalizeRule } from './schemaUtils'
import { ValueDecoderRule } from './types'
import {
  getValueDecoderRules,
  setValueDecoderRules,
} from './valueDecoderStorage'
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
  const { id: instanceId = '' } = useAppSelector(connectedInstanceSelector)
  const [decoders, setDecoders] = useState<ValueDecoderRule[]>(() =>
    getValueDecoderRules(instanceId),
  )
  const [modalConfig, setModalConfig] =
    useState<ValueDecoderModalConfig | null>(null)
  const [isDecodeEnabled, setIsDecodeEnabled] = useState(false)

  const keyName = keyProp ? bufferToString(keyProp) : ''
  const matchedRule = useMemo(
    () => (keyName ? findMatchingDecoderRule(decoders, keyName) : null),
    [decoders, keyName],
  )

  useEffect(() => {
    setDecoders(getValueDecoderRules(instanceId))
    setModalConfig(null)
    setIsDecodeEnabled(false)
  }, [instanceId])

  useEffect(() => {
    setIsDecodeEnabled(false)
  }, [keyName, matchedRule?.id ?? null])

  const openValueDecoderModal = useCallback(() => {
    setModalConfig({ keyName })
  }, [keyName])

  const handleSaveDecoders = useCallback(
    (nextDecoders: ValueDecoderRule[]) => {
      const normalized = nextDecoders.map(normalizeRule)
      setDecoders(normalized)
      setValueDecoderRules(instanceId, normalized)
      setModalConfig(null)
    },
    [instanceId],
  )

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
