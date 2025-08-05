import React, { useMemo } from 'react'
import { EuiIcon } from '@elastic/eui'
import { useSelector } from 'react-redux'

import { BulkActionsType } from 'uiSrc/constants'
import { selectedBulkActionsSelector } from 'uiSrc/slices/browser/bulkActions'
import BulkUpload from 'uiSrc/assets/img/icons/bulk-upload.svg?react'

import {
  getMatchType,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { RiTabs, TabInfo } from 'uiSrc/components/base/layout'

import { Text } from 'uiSrc/components/base/text'
import styles from './styles.module.scss'

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
            <EuiIcon type="trash" />
            <Text>Delete Keys</Text>
          </>
        ),
        content: null,
      },
      {
        value: BulkActionsType.Upload,
        label: (
          <>
            <EuiIcon type={BulkUpload} />
            <Text>Upload Data</Text>
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
