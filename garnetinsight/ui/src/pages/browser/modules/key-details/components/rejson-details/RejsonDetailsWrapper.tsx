import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { isUndefined } from 'lodash'

import {
  rejsonDataSelector,
  rejsonSelector,
} from 'uiSrc/slices/browser/rejson'
import {
  selectedKeyDataSelector,
  keysSelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { EditorType } from 'uiSrc/slices/interfaces'
import {
  sendEventTelemetry,
  TelemetryEvent,
  getBasedOnViewTypeEvent,
} from 'uiSrc/telemetry'
import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { stringToBuffer } from 'uiSrc/utils'
import { IJSONData } from 'uiSrc/pages/browser/modules/key-details/components/rejson-details/interfaces'

import { ProgressBarLoader } from 'uiSrc/components/base/display'
import RejsonDetails from './rejson-details'
import MonacoEditor from './monaco-editor'
import { parseJsonData } from './utils'
import styles from './styles.module.scss'

export interface Props extends KeyDetailsHeaderProps {}

const RejsonDetailsWrapper = (props: Props) => {
  const { loading, editorType } = useSelector(rejsonSelector)
  const { data, downloaded, type, path } = useSelector(rejsonDataSelector)

  const {
    name: selectedKey,
    nameString,
    length,
  } = useSelector(selectedKeyDataSelector) || {}
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const updatedData = parseJsonData(data)

  useEffect(() => {
    setExpandedRows(new Set())
  }, [nameString])

  const reportJSONKeyCollapsed = (level: number) => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_JSON_KEY_COLLAPSED,
        TelemetryEvent.TREE_VIEW_JSON_KEY_COLLAPSED,
      ),
      eventData: {
        databaseId: instanceId,
        level,
      },
    })
  }

  const reportJSONKeyExpanded = (level: number) => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_JSON_KEY_EXPANDED,
        TelemetryEvent.TREE_VIEW_JSON_KEY_EXPANDED,
      ),
      eventData: {
        databaseId: instanceId,
        level,
      },
    })
  }

  const handleJsonKeyExpandAndCollapse = (
    isExpanded: boolean,
    path: string,
  ) => {
    const matchedPath = path.match(/\[.+?\]/g)
    const levelFromPath = matchedPath ? matchedPath.length - 1 : 0
    if (isExpanded) {
      reportJSONKeyExpanded(levelFromPath)
    } else {
      reportJSONKeyCollapsed(levelFromPath)
    }

    setExpandedRows((rows) => {
      const copyOfSet = new Set(rows)
      if (isExpanded) copyOfSet.add(path)
      else copyOfSet.delete(path)

      return copyOfSet
    })
  }

  const shouldShowDefaultEditor =
    !isUndefined(updatedData) && editorType === EditorType.Default

  const shouldShowTextEditor =
    !isUndefined(updatedData) && editorType === EditorType.Text

  const keyDetailsBodyName = shouldShowDefaultEditor
    ? 'key-details-body'
    : 'key-details-body-monaco-editor'

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader {...props} key="key-details-header" />

      <div className={keyDetailsBodyName} key={keyDetailsBodyName}>
        <div className="flex-column" style={{ flex: '1', height: '100%' }}>
          <div data-testid="json-details" className={styles.container}>
            {loading && (
              <ProgressBarLoader
                color="primary"
                data-testid="progress-key-json"
              />
            )}

            {shouldShowDefaultEditor && (
              <RejsonDetails
                selectedKey={selectedKey || stringToBuffer('')}
                dataType={type || ''}
                data={updatedData as IJSONData}
                length={length}
                parentPath={path}
                expandedRows={expandedRows}
                onJsonKeyExpandAndCollapse={handleJsonKeyExpandAndCollapse}
                isDownloaded={downloaded}
              />
            )}

            {shouldShowTextEditor && (
              <MonacoEditor
                selectedKey={selectedKey || stringToBuffer('')}
                dataType={type || ''}
                data={updatedData as IJSONData}
                length={length}
                parentPath={path}
                expandedRows={expandedRows}
                onJsonKeyExpandAndCollapse={handleJsonKeyExpandAndCollapse}
                isDownloaded={downloaded}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { RejsonDetailsWrapper }
