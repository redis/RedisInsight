import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'

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
import { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { Text } from 'uiSrc/components/base/text'

import { StyledTabs } from './BulkActionsTabs.styles'

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
        label: <Text size="S">Delete Keys</Text>,
        content: null,
      },
      {
        value: BulkActionsType.Upload,
        label: <Text size="S">Upload Data</Text>,
        content: null,
      },
    ],
    [],
  )

  return (
    <StyledTabs
      tabs={tabs}
      value={type ?? undefined}
      onChange={onSelectedTabChanged}
      data-testid="bulk-actions-tabs"
    />
  )
}

export default BulkActionsTabs
