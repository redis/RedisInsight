import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { escapeRegExp } from 'lodash'

import {
  appContextBrowserTree,
  appContextDbConfig,
  resetBrowserTree,
  setBrowserTreeNodesOpen,
} from 'uiSrc/slices/app/context'
import { constructKeysToTree } from 'uiSrc/helpers'
import VirtualTree from 'uiSrc/pages/browser/components/virtual-tree'
import TreeViewSVG from 'uiSrc/assets/img/icons/treeview.svg'
import { bufferToString, comboBoxToArray, Nullable } from 'uiSrc/utils'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { BulkActionsType, KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'
import {
  deleteKeyAction,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import {
  setBulkActionType,
  setBulkDeleteFilter,
  setBulkDeleteKeyCount,
  setBulkDeleteSearch,
  setBulkDeleteStartAgain,
} from 'uiSrc/slices/browser/bulkActions'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { GetKeyInfoResponse } from 'apiSrc/modules/browser/keys/dto'

import styles from './styles.module.scss'
import { KeyTreeProps } from './KeyTree.types'
import NoKeysMessage from '../no-keys-message'

export const firstPanelId = 'tree'
export const secondPanelId = 'keys'

const parseKeyNames = (keys: GetKeyInfoResponse[]) =>
  keys.map((item) => ({
    ...item,
    nameString: item.nameString ?? bufferToString(item.name),
  }))

const KeyTree = forwardRef((props: KeyTreeProps, ref) => {
  const {
    selectKey,
    loadMoreItems,
    loading,
    keysState,
    onDelete,
    commonFilterType,
    deleting,
    onAddKeyPanel,
    onBulkActionsPanel,
    visibleColumns,
  } = props

  const { instanceId } = useParams<{ instanceId: string }>()
  const { openNodes } = useSelector(appContextBrowserTree)
  const { treeViewDelimiter, treeViewSort: sorting } =
    useSelector(appContextDbConfig)
  const { nameString: selectedKeyName = null } =
    useSelector(selectedKeyDataSelector) ?? {}

  const [statusOpen, setStatusOpen] = useState(openNodes)
  const [constructingTree, setConstructingTree] = useState(false)
  const [firstDataLoaded, setFirstDataLoaded] = useState<boolean>(
    !!keysState.keys.length,
  )
  const [items, setItems] = useState<IKeyPropTypes[]>(
    parseKeyNames(keysState.keys ?? []),
  )

  // escape regexp symbols and join and transform to regexp
  const delimiters = comboBoxToArray(treeViewDelimiter)
  const delimiterPattern = delimiters.map(escapeRegExp).join('|')

  const dispatch = useDispatch()

  useImperativeHandle(ref, () => ({
    handleLoadMoreItems(config: { startIndex: number; stopIndex: number }) {
      onLoadMoreItems(config)
    },
  }))

  useEffect(() => {
    openSelectedKey(selectedKeyName)
  }, [])

  useEffect(() => {
    setStatusOpen(openNodes)
  }, [openNodes])

  // open all parents for selected key
  const openSelectedKey = (selectedKeyName: Nullable<string> = '') => {
    if (selectedKeyName) {
      const parts = selectedKeyName.split(delimiterPattern)
      const parents = parts.map(
        (_, index) =>
          parts.slice(0, index + 1).join(delimiterPattern) + delimiterPattern,
      )

      // remove key name from parents
      parents.pop()

      if (parents.length === 0) return

      // Use functional update to avoid stale closure issues
      setStatusOpen((prevState) => {
        const newOpenNodes = { ...prevState }
        parents.forEach((parent) => {
          newOpenNodes[parent] = true
        })
        dispatch(setBrowserTreeNodesOpen(newOpenNodes))
        return newOpenNodes
      })
    }
  }

  useEffect(() => {
    setItems(parseKeyNames(keysState.keys))

    if (keysState.keys?.length === 0) {
      updateSelectedKeys()
    }
  }, [keysState.keys])

  useEffect(() => {
    if (keysState.lastRefreshTime) {
      setFirstDataLoaded(true)
    }

    setItems(parseKeyNames(keysState.keys))
  }, [keysState.lastRefreshTime, delimiterPattern, sorting])

  useEffect(() => {
    openSelectedKey(selectedKeyName)
  }, [selectedKeyName])

  const onLoadMoreItems = (props: {
    startIndex: number
    stopIndex: number
  }) => {
    const formattedAllKeys = parseKeyNames(keysState.keys)
    loadMoreItems?.(formattedAllKeys, props)
  }

  // select default leaf "Keys" after each change delimiter, filter or search
  const updateSelectedKeys = () => {
    dispatch(resetBrowserTree())
    openSelectedKey(selectedKeyName)
  }

  const handleStatusOpen = (name: string, value: boolean) => {
    setStatusOpen((prevState) => {
      const newState = { ...prevState }
      // add or remove opened node
      if (!value) {
        delete newState[name]
      } else {
        newState[name] = value
      }

      dispatch(setBrowserTreeNodesOpen(newState))
      return newState
    })
  }

  const handleStatusSelected = (name: RedisString) => {
    selectKey({ rowData: { name } })
  }

  const handleDeleteLeaf = (key: RedisResponseBuffer) => {
    dispatch(
      deleteKeyAction(key, () => {
        onDelete(key)
      }),
    )
  }

  const handleDeleteClicked = (type: KeyTypes | ModulesKeyTypes) => {
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_KEY_DELETE_CLICKED,
      eventData: {
        databaseId: instanceId,
        keyType: type,
        source: 'keyList',
      },
    })
  }

  const handleDeleteFolder = (
    pattern: string,
    fullName: string,
    keyCount: number,
  ) => {
    // Reset previous bulk delete state first
    dispatch(setBulkDeleteStartAgain())

    // Set bulk delete state - preserve current key type filter
    dispatch(setBulkDeleteSearch(pattern))
    dispatch(setBulkDeleteFilter(commonFilterType))
    dispatch(setBulkDeleteKeyCount(keyCount))
    dispatch(setBulkActionType(BulkActionsType.Delete))

    // Open panel
    onBulkActionsPanel(true)

    // Telemetry
    sendEventTelemetry({
      event: TelemetryEvent.TREE_VIEW_FOLDER_DELETE_CLICKED,
      eventData: {
        databaseId: instanceId,
        keyCount,
      },
    })
  }

  if (keysState.keys.length === 0) {
    const NoItemsMessage = () => (
      <NoKeysMessage
        isLoading={loading || !firstDataLoaded}
        total={keysState.total}
        scanned={keysState.scanned}
        onAddKeyPanel={onAddKeyPanel}
      />
    )

    return (
      <div className={cx(styles.content)}>
        <div className={cx(styles.noKeys)}>
          <NoItemsMessage />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <VirtualTree
          items={items}
          loadingIcon={TreeViewSVG}
          delimiters={delimiters}
          delimiterPattern={delimiterPattern}
          sorting={sorting}
          deleting={deleting}
          statusSelected={selectedKeyName}
          statusOpen={statusOpen}
          loading={loading || constructingTree}
          commonFilterType={commonFilterType}
          setConstructingTree={setConstructingTree}
          webworkerFn={constructKeysToTree}
          onStatusSelected={handleStatusSelected}
          onStatusOpen={handleStatusOpen}
          onDeleteClicked={handleDeleteClicked}
          onDeleteLeaf={handleDeleteLeaf}
          onDeleteFolder={handleDeleteFolder}
          visibleColumns={visibleColumns}
        />
      </div>
    </div>
  )
})

export default React.memo(KeyTree)
