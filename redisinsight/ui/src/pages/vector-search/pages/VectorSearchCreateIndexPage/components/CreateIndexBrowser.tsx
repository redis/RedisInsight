import React, { useCallback, useEffect, useRef, useState } from 'react'

import { KeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import {
  KEY_TYPE_MAP,
  REVERSE_KEY_TYPE_MAP,
} from 'uiSrc/pages/vector-search/constants'
import { bufferToString } from 'uiSrc/utils'

import KeysBrowser from '../../../components/keys-browser/KeysBrowser'
import { useLoadKeyData } from '../../../hooks'
import { extractNamespace, deriveIndexName } from '../../../utils'

import { useCreateIndexPage } from '../../../context/create-index-page'
import { ConfirmKeyChangeModal } from './ConfirmKeyChangeModal'
import * as S from '../VectorSearchCreateIndexPage.styles'

export const CreateIndexBrowser = () => {
  const {
    showBrowser,
    initialKey,
    initialKeyType,
    isFieldsDirty,
    resetFieldsDirty,
    setFields,
    setKeyType,
    setIndexPrefix,
    setIndexName,
  } = useCreateIndexPage()

  const {
    loadKeyData,
    fields: loadedFields,
    skippedFields: loadedSkippedFields,
  } = useLoadKeyData()
  const prevLoadedFieldsRef = useRef(loadedFields)

  const [pendingKey, setPendingKey] = useState<{
    key: RedisResponseBuffer
    keyType: KeyTypes
  } | null>(null)

  useEffect(() => {
    if (loadedFields !== prevLoadedFieldsRef.current) {
      setFields(loadedFields, loadedSkippedFields)
    }
    prevLoadedFieldsRef.current = loadedFields
  }, [loadedFields, loadedSkippedFields, setFields])

  const applyKeySelection = useCallback(
    (key: RedisResponseBuffer, keyType: KeyTypes) => {
      const indexKeyType = KEY_TYPE_MAP[keyType] ?? RedisearchIndexKeyType.HASH
      setKeyType(indexKeyType)

      const keyName = bufferToString(key)
      const namespace = extractNamespace(keyName)
      setIndexPrefix(namespace)
      setIndexName(deriveIndexName(namespace))

      loadKeyData(key, indexKeyType)
    },
    [loadKeyData, setKeyType, setIndexPrefix, setIndexName],
  )

  const handleSelectKey = useCallback(
    (key: RedisResponseBuffer, keyType: KeyTypes) => {
      if (isFieldsDirty) {
        setPendingKey({ key, keyType })
        return
      }
      applyKeySelection(key, keyType)
    },
    [isFieldsDirty, applyKeySelection],
  )

  const handleConfirmKeyChange = useCallback(() => {
    resetFieldsDirty()
    if (pendingKey) {
      applyKeySelection(pendingKey.key, pendingKey.keyType)
    }
    setPendingKey(null)
  }, [pendingKey, applyKeySelection, resetFieldsDirty])

  const handleCancelKeyChange = useCallback(() => {
    setPendingKey(null)
  }, [])

  if (!showBrowser) return null

  return (
    <>
      <S.BrowserPanel data-testid="vector-search--create-index--browser-panel">
        <KeysBrowser
          onSelectKey={handleSelectKey}
          initialKey={initialKey}
          initialKeyType={
            initialKeyType ? REVERSE_KEY_TYPE_MAP[initialKeyType] : undefined
          }
        />
      </S.BrowserPanel>

      {pendingKey && (
        <ConfirmKeyChangeModal
          onConfirm={handleConfirmKeyChange}
          onCancel={handleCancelKeyChange}
        />
      )}
    </>
  )
}
