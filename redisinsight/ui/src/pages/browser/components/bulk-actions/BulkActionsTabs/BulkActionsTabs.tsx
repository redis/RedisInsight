import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { RiTabs, TabInfo } from 'uiBase/layout'
import { RiText } from 'uiBase/text'
import { BulkActionsType } from 'uiSrc/constants'
import { selectedBulkActionsSelector } from 'uiSrc/slices/browser/bulkActions'

import {
  getMatchType,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import { keysSelector } from 'uiSrc/slices/browser/keys'

import styles from './styles.module.scss'
import { RiIcon } from 'uiBase/icons'

export interface Props {
  onChangeType: (id: BulkActionsType) => void
}

const BulkActionsTabs = (props: Props) => {
  const { onChangeType } = props
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { filter, search } = useSelector(keysSelector)
  const { type } = useSelector(selectedBulkActionsSelector)

  const onSelectedTabChanged = (id: string) => {
    const eventData: Record<string, any> = {
      databaseId: instanceId,
      action: id,
    }

    if (id === BulkActionsType.Delete) {
      eventData.filter = {
        match:
          search && search !== DEFAULT_SEARCH_MATCH
            ? getMatchType(search)
            : DEFAULT_SEARCH_MATCH,
        type: filter,
      }
    }

    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_OPENED,
      eventData,
    })
    onChangeType(id as BulkActionsType)
  }

  const tabs: TabInfo[] = useMemo(
    () => [
      {
        value: BulkActionsType.Delete,
        label: (
          <>
            <RiIcon type="DeleteIcon" />
            <RiText>Delete Keys</RiText>
          </>
        ),
        content: null,
      },
      {
        value: BulkActionsType.Upload,
        label: (
          <>
            <RiIcon type={'BulkUploadIcon'} />
            <RiText>Upload Data</RiText>
          </>
        ),
        content: null,
      },
    ],
    [],
  )

  return (
    <RiTabs
      tabs={tabs}
      value={type ?? undefined}
      onChange={onSelectedTabChanged}
      className={styles.tabs}
      data-testid="bulk-actions-tabs"
    />
  )
}

export default BulkActionsTabs
