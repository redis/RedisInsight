import React, { useCallback, useMemo } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiTooltip } from 'uiSrc/components'
import { Trans, useTranslation, escapeTrans } from 'uiSrc/i18n'
import { KEY_TYPE_MAP } from 'uiSrc/pages/vector-search/constants'
import { extractNamespace } from 'uiSrc/pages/vector-search/utils'
import { useMakeSearchableModal } from 'uiSrc/pages/browser/components/make-searchable-modal'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { SearchBrowserSource } from 'uiSrc/pages/vector-search/telemetry.constants'

import { MakeSearchableButtonProps } from './MakeSearchableButton.types'

export const MakeSearchableButton = ({
  keyName,
  keyNameString,
  keyType,
}: MakeSearchableButtonProps) => {
  const { t } = useTranslation()
  const { openMakeSearchableModal } = useMakeSearchableModal()
  const { id: instanceId } = useAppSelector(connectedInstanceSelector)

  const prefix = useMemo(() => extractNamespace(keyNameString), [keyNameString])

  const source = SearchBrowserSource.KeyDetails

  const mappedKeyType = KEY_TYPE_MAP[keyType]

  const handleOpen = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.SEARCH_MAKE_SEARCHABLE_CLICKED,
      eventData: { databaseId: instanceId, keyType: mappedKeyType, source },
    })
    openMakeSearchableModal({
      prefix,
      initialKey: keyName,
      initialKeyType: mappedKeyType,
      initialPrefix: prefix,
      source,
    })
  }, [
    openMakeSearchableModal,
    keyName,
    keyType,
    prefix,
    instanceId,
    mappedKeyType,
  ])

  return (
    <RiTooltip
      position="top"
      content={
        <span>
          <Trans
            i18nKey="browser.makeSearchable.tooltip"
            values={{ prefix: escapeTrans(prefix) }}
            components={{ bold: <strong /> }}
          />
        </span>
      }
    >
      <PrimaryButton
        size="small"
        onClick={handleOpen}
        data-testid="make-searchable-btn"
      >
        {t('browser.makeSearchable.button.trigger')}
      </PrimaryButton>
    </RiTooltip>
  )
}
