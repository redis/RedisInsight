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
  resetBrowserTree,
  appContextDbConfig,
  setBrowserTreeNodesOpen,
} from 'uiSrc/slices/app/context'
import { constructKeysToTree } from 'uiSrc/helpers'
import VirtualTree from 'uiSrc/pages/browser/components/virtual-tree'
import TreeViewSVG from 'uiSrc/assets/img/icons/treeview.svg'
import { KeysStoreData } from 'uiSrc/slices/interfaces/keys'
import { Nullable, bufferToString, comboBoxToArray } from 'uiSrc/utils'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'
import {
  deleteKeyAction,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { GetKeyInfoResponse } from 'apiSrc/modules/browser/keys/dto'

import NoKeysMessage from '../no-keys-message'
import styles from './styles.module.scss'

export interface Props {
  keysState: KeysStoreData
  loading: boolean
  deleting: boolean
  commonFilterType: Nullable<KeyTypes>
  selectKey: ({ rowData }: { rowData: any }) => void
  loadMoreItems: (
    oldKeys: IKeyPropTypes[],
    { startIndex, stopIndex }: { startIndex: number; stopIndex: number },
  ) => void
  onDelete: (key: RedisResponseBuffer) => void
  onAddKeyPanel: (value: boolean) => void
}

export const firstPanelId = 'tree'
export const secondPanelId = 'keys'

const parseKeyNames = (keys: GetKeyInfoResponse[]) =>
  keys.map((item) => ({
    ...item,
    nameString: item.nameString ?? bufferToString(item.name),
  }))

const KeyTree = forwardRef((props: Props, ref) => {
  const {
    selectKey,
    loadMoreItems,
    loading,
    keysState,
    onDelete,
    commonFilterType,
    deleting,
    onAddKeyPanel,
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

      // Batch all parent updates into a single state update
      const newOpenNodes: { [key: string]: boolean } = { ...statusOpen }
      parents.forEach((parent) => {
        newOpenNodes[parent] = true
      })

      setStatusOpen(newOpenNodes)
      dispatch(setBrowserTreeNodesOpen(newOpenNodes))
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
    const newState = { ...statusOpen }
    // add or remove opened node
    if (!value) {
      delete newState[name]
    } else {
      newState[name] = value
    }

    setStatusOpen(newState)
    dispatch(setBrowserTreeNodesOpen(newState))
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
        />
      </div>
    </div>
  )
})

export default React.memo(KeyTree)
