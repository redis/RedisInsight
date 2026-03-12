import React, { useCallback, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { KeyTypes, Pages } from 'uiSrc/constants'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { CreateIndexMode } from 'uiSrc/pages/vector-search/pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'
import { extractNamespace } from 'uiSrc/pages/vector-search/utils'
import { MakeSearchableModal } from 'uiSrc/pages/browser/components/make-searchable-modal'

import { MakeSearchableButtonProps } from './MakeSearchableButton.types'

const KEY_TYPE_MAP: Partial<Record<KeyTypes, RedisearchIndexKeyType>> = {
  [KeyTypes.Hash]: RedisearchIndexKeyType.HASH,
  [KeyTypes.ReJSON]: RedisearchIndexKeyType.JSON,
}

export const MakeSearchableButton = ({
  keyName,
  keyNameString,
  keyType,
  instanceId,
}: MakeSearchableButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const history = useHistory()

  const prefix = extractNamespace(keyNameString)

  const handleConfirm = useCallback(() => {
    setIsModalOpen(false)
    history.push(Pages.vectorSearchCreateIndex(instanceId), {
      mode: CreateIndexMode.ExistingData,
      initialKey: keyName,
      initialKeyType: KEY_TYPE_MAP[keyType],
      initialPrefix: prefix,
    })
  }, [history, instanceId, keyName, prefix, keyType])

  return (
    <>
      <PrimaryButton
        size="small"
        onClick={() => setIsModalOpen(true)}
        data-testid="make-searchable-btn"
      >
        Make searchable
      </PrimaryButton>
      <MakeSearchableModal
        isOpen={isModalOpen}
        prefix={prefix || undefined}
        onConfirm={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  )
}
