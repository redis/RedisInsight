import React, { useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { KEY_TYPE_MAP } from 'uiSrc/pages/vector-search/constants'
import { CreateIndexMode } from 'uiSrc/pages/vector-search/pages/VectorSearchCreateIndexPage/VectorSearchCreateIndexPage.types'
import { extractNamespace } from 'uiSrc/pages/vector-search/utils'
import { MakeSearchableModal } from 'uiSrc/pages/browser/components/make-searchable-modal'

import { MakeSearchableButtonProps } from './MakeSearchableButton.types'

export const MakeSearchableButton = ({
  keyName,
  keyNameString,
  keyType,
  instanceId,
}: MakeSearchableButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const history = useHistory()

  const prefix = useMemo(() => extractNamespace(keyNameString), [keyNameString])

  const handleOpen = useCallback(() => setIsModalOpen(true), [])
  const handleCancel = useCallback(() => setIsModalOpen(false), [])

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
        onClick={handleOpen}
        data-testid="make-searchable-btn"
      >
        Make searchable
      </PrimaryButton>
      {isModalOpen && (
        <MakeSearchableModal
          isOpen
          prefix={prefix || undefined}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}
