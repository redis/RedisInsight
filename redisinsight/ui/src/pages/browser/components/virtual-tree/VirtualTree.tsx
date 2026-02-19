import React, { useCallback, useEffect, useRef, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { debounce, get, set } from 'lodash'
import { TreeWalker, TreeWalkerValue, FixedSizeTree as Tree } from 'react-vtree'
import { useDispatch } from 'react-redux'

import { bufferToString, Nullable } from 'uiSrc/utils'
import { useDisposableWebworker } from 'uiSrc/services'
import { DEFAULT_TREE_SORTING, KeyTypes } from 'uiSrc/constants'
import { RedisString } from 'uiSrc/slices/interfaces'
import { fetchKeysMetadataTree } from 'uiSrc/slices/browser/keys'
import {
  Loader,
  ProgressBarLoader,
  RiImage,
} from 'uiSrc/components/base/display'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { GetKeyInfoResponse } from 'apiSrc/modules/browser/keys/dto'

import { Node } from './components/Node'
import {
  NodeMeta,
  TreeData,
  TreeNode,
  VirtualTreeProps,
} from './VirtualTree.types'

import styles from './styles.module.scss'

export const KEYS = 'keys'

const VirtualTree = (props: VirtualTreeProps) => {
  const {
    items,
    delimiterPattern,
    delimiters,
    loadingIcon = 'empty',
    statusOpen = {},
    statusSelected,
    loading,
    deleting,
    sorting = DEFAULT_TREE_SORTING,
    commonFilterType,
    onStatusOpen,
    onStatusSelected,
    setConstructingTree,
    webworkerFn = () => {},
    onDeleteClicked,
    onDeleteLeaf,
    onDeleteFolder,
    visibleColumns,
    showFolderMetadata,
  } = props

  const [rerenderState, rerender] = useState({})
  const controller = useRef<Nullable<AbortController>>(null)
  const elements = useRef<any>({})
  const nodes = useRef<TreeNode[]>([])

  const { result, run: runWebworker } = useDisposableWebworker(webworkerFn)

  const dispatch = useDispatch()

  useEffect(
    () => () => {
      nodes.current = []
      elements.current = {}
    },
    [],
  )

  // receive result from the "runWebworker"
  useEffect(() => {
    if (!result) {
      return
    }

    elements.current = {}
    nodes.current = result
    rerender({})
    setConstructingTree?.(false)

    openSingleFolderNode(nodes.current)
  }, [result])

  useEffect(() => {
    if (!items?.length) {
      nodes.current = []
      elements.current = {}
      rerender({})
      runWebworker?.({ items: [], delimiterPattern, delimiters, sorting })
      return
    }

    setConstructingTree(true)
    runWebworker?.({ items, delimiterPattern, delimiters, sorting })
  }, [items, delimiterPattern])

  const handleUpdateSelected = useCallback(
    (name: RedisString) => {
      onStatusSelected?.(name)
    },
    [onStatusSelected],
  )

  const handleUpdateOpen = useCallback(
    (fullName: string, value: boolean) => {
      onStatusOpen?.(fullName, value)
    },
    [onStatusOpen, nodes],
  )

  const updateNodeByPath = (path: string, data: any) => {
    const paths = path.replaceAll('.', '.children.')

    const node = get(nodes.current, paths)
    const fullData = { ...node, ...data }

    if (node) {
      set(nodes.current, paths, fullData)
    }
  }

  const formatItem = useCallback(
    (item: GetKeyInfoResponse) => ({
      ...item,
      nameString: bufferToString(item.name as string),
    }),
    [],
  )

  const getMetadata = useCallback(
    (itemsInit: any[] = [], filter: Nullable<KeyTypes>): void => {
      dispatch(
        fetchKeysMetadataTree(
          itemsInit,
          filter,
          controller.current?.signal,
          (loadedItems) => onSuccessFetchedMetadata(loadedItems),
          () => {
            rerender({})
          },
        ),
      )
    },
    [],
  )

  const onSuccessFetchedMetadata = (loadedItems: any[]) => {
    const items = loadedItems.map(formatItem)

    items.forEach((item: any) => updateNodeByPath(item.path, item))

    rerender({})
  }

  const getMetadataDebounced = debounce((filter: Nullable<KeyTypes>) => {
    const entries = Object.entries(elements.current)

    getMetadata(entries, filter)

    elements.current = {}
  }, 100)

  const getMetadataNode = useCallback(
    (nameBuffer: any, path: string) => {
      elements.current[path] = nameBuffer
      getMetadataDebounced(commonFilterType)
    },
    [commonFilterType],
  )

  // This helper function constructs the object that will be sent back at the step
  // [2] during the treeWalker function work. Except for the mandatory `data`
  // field you can put any additional data here.
  const getNodeData = (
    node: TreeNode,
    nestingLevel: number,
  ): TreeWalkerValue<TreeData, NodeMeta> => ({
    data: {
      id: node.id.toString(),
      isLeaf: node.isLeaf,
      keyCount: node.keyCount,
      name: node.name,
      nameString: node.nameString,
      nameBuffer: node.nameBuffer,
      ttl: node.ttl,
      size: node.size,
      type: node.type,
      fullName: node.fullName,
      shortName: node.nameString
        ?.split(new RegExp(delimiterPattern, 'g'))
        .pop(),
      delimiters,
      nestingLevel,
      deleting,
      path: node.path,
      getMetadata: getMetadataNode,
      onDeleteClicked,
      updateStatusSelected: handleUpdateSelected,
      updateStatusOpen: handleUpdateOpen,
      onDelete: onDeleteLeaf,
      onDeleteFolder,
      keyApproximate: node.keyApproximate,
      isSelected: !!node.isLeaf && statusSelected === node?.nameString,
      isOpenByDefault: statusOpen[node.fullName],
      visibleColumns,
      showFolderMetadata,
    },
    nestingLevel,
    node,
  })

  const openSingleFolderNode = useCallback(
    (treeNodes?: TreeNode[]) => {
      let nodes = treeNodes
      while (nodes?.length === 1) {
        const singleNode = nodes[0]
        onStatusOpen?.(singleNode.fullName, true)
        nodes = singleNode.children
      }
    },
    [onStatusOpen],
  )

  // The `treeWalker` function runs only on tree re-build which is performed
  // whenever the `treeWalker` prop is changed.
  const treeWalker = useCallback(
    function* treeWalker(): ReturnType<TreeWalker<TreeData, NodeMeta>> {
      // Step [1]: Define the root multiple nodes of our tree
      for (let i = 0; i < nodes.current.length; i++) {
        yield getNodeData(nodes.current[i], 0)
      }

      // Step [2]: Get the parent component back. It will be the object
      // the `getNodeData` function constructed, so you can read any data from it.
      while (true) {
        const parentMeta = yield

        for (let i = 0; i < parentMeta.node.children?.length; i++) {
          // Step [3]: Yielding all the children of the provided component. Then we
          // will return for the step [2] with the first children.
          yield getNodeData(
            parentMeta.node.children[i],
            parentMeta.nestingLevel + 1,
          )
        }
      }
    },
    [statusSelected, statusOpen, rerenderState, visibleColumns],
  )

  return (
    <AutoSizer>
      {({ height, width }) => (
        <div data-testid="virtual-tree" style={{ position: 'relative' }}>
          {nodes.current.length > 0 && (
            <>
              {loading && (
                <ProgressBarLoader
                  color="primary"
                  data-testid="progress-key-tree"
                  absolute
                  style={{ width, zIndex: 1 }}
                />
              )}
              <Tree
                async
                height={height}
                width={width}
                itemSize={42}
                treeWalker={treeWalker}
                className={styles.customScroll}
              >
                {Node}
              </Tree>
            </>
          )}
          {nodes.current.length === 0 && loading && (
            <div
              className={styles.loadingContainer}
              style={{ width, height }}
              data-testid="virtual-tree-spinner"
            >
              <div className={styles.loadingBody}>
                <Loader size="xl" className={styles.loadingSpinner} />
                {loadingIcon ? (
                  <RiImage
                    className={styles.loadingIcon}
                    src={loadingIcon}
                    alt="loading"
                  />
                ) : (
                  <RiIcon
                    type="LoaderLargeIcon"
                    className={styles.loadingIcon}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </AutoSizer>
  )
}

export default VirtualTree
