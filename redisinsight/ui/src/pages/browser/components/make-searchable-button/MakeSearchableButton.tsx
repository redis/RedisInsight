import React, { useCallback, useMemo } from 'react'

import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { KEY_TYPE_MAP } from 'uiSrc/pages/vector-search/constants'
import { extractNamespace } from 'uiSrc/pages/vector-search/utils'
import { useMakeSearchableModal } from 'uiSrc/pages/browser/components/make-searchable-modal'

import { MakeSearchableButtonProps } from './MakeSearchableButton.types'

export const MakeSearchableButton = ({
  keyName,
  keyNameString,
  keyType,
}: MakeSearchableButtonProps) => {
  const { openMakeSearchableModal } = useMakeSearchableModal()

  const prefix = useMemo(() => extractNamespace(keyNameString), [keyNameString])

  const handleOpen = useCallback(() => {
    openMakeSearchableModal({
      prefix,
      initialKey: keyName,
      initialKeyType: KEY_TYPE_MAP[keyType],
      initialPrefix: prefix,
    })
  }, [openMakeSearchableModal, keyName, keyType, prefix])

  return (
    <PrimaryButton
      size="small"
      onClick={handleOpen}
      data-testid="make-searchable-btn"
    >
      Make searchable
    </PrimaryButton>
  )
}
