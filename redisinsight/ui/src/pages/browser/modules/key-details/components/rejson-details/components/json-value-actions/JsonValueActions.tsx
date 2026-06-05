import React from 'react'

import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { fetchDownloadJsonValue } from 'uiSrc/slices/browser/rejson'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { downloadFile } from 'uiSrc/utils/dom/downloadFile'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { CopyButton } from 'uiSrc/components/copy-button'
import { RiTooltip } from 'uiSrc/components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { DownloadIcon } from 'uiSrc/components/base/icons'

import { IJSONData } from '../../interfaces'
import { jsonToReadableString } from '../../utils'

export interface Props {
  data: IJSONData
  selectedKey: RedisResponseBuffer
  isDownloaded: boolean
}

const JsonValueActions = ({ data, selectedKey, isDownloaded }: Props) => {
  const { viewType } = useAppSelector(keysSelector)
  const { id: instanceId } = useAppSelector(connectedInstanceSelector)
  const dispatch = useAppDispatch()

  const handleCopy = () => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_JSON_VALUE_COPIED,
        TelemetryEvent.TREE_VIEW_JSON_VALUE_COPIED,
      ),
      eventData: { databaseId: instanceId },
    })
  }

  const handleDownload = () => {
    dispatch(fetchDownloadJsonValue(selectedKey, '$', downloadFile))
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_JSON_VALUE_DOWNLOADED,
        TelemetryEvent.TREE_VIEW_JSON_VALUE_DOWNLOADED,
      ),
      eventData: { databaseId: instanceId },
    })
  }

  // When the whole value is in memory we can copy it directly; otherwise the
  // value is lazy-loaded, so we download the full value to a file instead.
  return isDownloaded ? (
    <CopyButton
      copy={jsonToReadableString(data)}
      aria-label="Copy value"
      onCopy={handleCopy}
      data-testid="copy-json-value"
    />
  ) : (
    <RiTooltip content="Download" position="left">
      <IconButton
        icon={DownloadIcon}
        aria-label="Download value"
        onClick={handleDownload}
        data-testid="download-json-value"
      />
    </RiTooltip>
  )
}

export default JsonValueActions
