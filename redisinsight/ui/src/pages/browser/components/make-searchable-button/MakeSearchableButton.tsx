import React, { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { KEY_TYPE_MAP } from 'uiSrc/pages/vector-search/constants'
import { extractNamespace } from 'uiSrc/pages/vector-search/utils'
import { useMakeSearchableModal } from 'uiSrc/pages/browser/components/make-searchable-modal'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { MakeSearchableButtonProps } from './MakeSearchableButton.types'

export const MakeSearchableButton = ({
  keyName,
  keyNameString,
  keyType,
}: MakeSearchableButtonProps) => {
  const { openMakeSearchableModal } = useMakeSearchableModal()
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const prefix = useMemo(() => extractNamespace(keyNameString), [keyNameString])

  const handleOpen = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_MAKE_SEARCHABLE_CLICKED,
      eventData: { databaseId: instanceId, keyType },
    })
    openMakeSearchableModal({
      prefix,
      initialKey: keyName,
      initialKeyType: KEY_TYPE_MAP[keyType],
      initialPrefix: prefix,
    })
  }, [openMakeSearchableModal, keyName, keyType, prefix, instanceId])

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
