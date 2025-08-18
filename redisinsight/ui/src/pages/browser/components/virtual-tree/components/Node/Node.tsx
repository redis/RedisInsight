import React, { useEffect, useState, useRef } from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import cx from 'classnames'
import { useSelector } from 'react-redux'

import { RiIcon } from 'uiBase/icons'
import * as keys from 'uiSrc/constants/keys'
import { Maybe } from 'uiSrc/utils'
import { KeyTypes, ModulesKeyTypes, BrowserColumns } from 'uiSrc/constants'
import KeyRowTTL from 'uiSrc/pages/browser/components/key-row-ttl'
import KeyRowSize from 'uiSrc/pages/browser/components/key-row-size'
import KeyRowName from 'uiSrc/pages/browser/components/key-row-name'
import KeyRowType from 'uiSrc/pages/browser/components/key-row-type'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { RiTooltip } from 'uiBase/display'
import { DeleteKeyPopover } from '../../../delete-key-popover/DeleteKeyPopover'
import { TreeData } from '../../interfaces'
import styles from './styles.module.scss'

const MAX_NESTING_LEVEL = 20

// Node component receives all the data we created in the `treeWalker` +
// internal openness state (`isOpen`), function to change internal openness
// `style` parameter that should be added to the root div.
const Node = ({
  data,
  isOpen,
  index,
  style,
  setOpen,
}: NodePublicState<TreeData>) => {
  const {
    id: nodeId,
    isLeaf,
    keyCount,
    nestingLevel,
    fullName,
    nameBuffer,
    path,
    type,
    ttl,
    shortName,
    size,
    deleting,
    nameString,
    keyApproximate,
    isSelected,
    delimiters = [],
    getMetadata,
    onDelete,
    onDeleteClicked,
    updateStatusOpen,
    updateStatusSelected,
  } = data

  const delimiterView = delimiters.length === 1 ? delimiters[0] : '-'

  const { shownColumns } = useSelector(appContextDbConfig)
  const includeSize = shownColumns.includes(BrowserColumns.Size)
  const includeTTL = shownColumns.includes(BrowserColumns.TTL)

  const [deletePopoverId, setDeletePopoverId] =
    useState<Maybe<string>>(undefined)
  const prevIncludeSize = useRef(includeSize)
  const prevIncludeTTL = useRef(includeTTL)

  useEffect(() => {
    const isSizeReenabled = !prevIncludeSize.current && includeSize
    const isTtlReenabled = !prevIncludeTTL.current && includeTTL

    if (
      isLeaf &&
      nameBuffer &&
      (isSizeReenabled || isTtlReenabled || (!size && !ttl))
    ) {
      getMetadata?.(nameBuffer, path)
    }

    prevIncludeSize.current = includeSize
    prevIncludeTTL.current = includeTTL
  }, [includeSize, includeTTL, isLeaf, nameBuffer, size, ttl])

  const handleClick = () => {
    if (isLeaf) {
      updateStatusSelected?.(nameBuffer)
    }

    updateStatusOpen?.(fullName, !isOpen)
    !isLeaf && setOpen(!isOpen)
  }

  const handleKeyDown = ({ key }: React.KeyboardEvent<HTMLDivElement>) => {
    if (key === keys.SPACE) {
      handleClick()
    }
  }

  const handleDelete = (nameBuffer: RedisResponseBuffer) => {
    onDelete(nameBuffer)
    setDeletePopoverId(undefined)
  }

  const handleDeletePopoverOpen = (
    index: Maybe<string>,
    type: KeyTypes | ModulesKeyTypes,
  ) => {
    if (index !== deletePopoverId) {
      onDeleteClicked(type)
    }
    setDeletePopoverId(index !== deletePopoverId ? index : undefined)
  }

  const Folder = () => (
    <RiTooltip
      content={tooltipContent}
      position="bottom"
      anchorClassName={styles.anchorTooltipNode}
    >
      <>
        <div className={styles.nodeName}>
          <RiIcon
            type={isOpen ? 'ArrowDownIcon' : 'ArrowRightIcon'}
            className={cx(styles.nodeIcon, styles.nodeIconArrow)}
            data-test-subj={`node-arrow-icon_${fullName}`}
          />
          <RiIcon
            type="FolderIcon"
            className={styles.nodeIcon}
            data-test-subj={`node-folder-icon_${fullName}`}
          />
          <span className="truncateText" data-testid={`folder-${nameString}`}>
            {nameString}
          </span>
        </div>
        <div className={styles.options}>
          <div
            className={styles.approximate}
            data-testid={`percentage_${fullName}`}
          >
            {keyApproximate
              ? `${keyApproximate < 1 ? '<1' : Math.round(keyApproximate)}%`
              : ''}
          </div>
          <div className={styles.keyCount} data-testid={`count_${fullName}`}>
            {keyCount ?? ''}
          </div>
        </div>
      </>
    </RiTooltip>
  )

  const Leaf = () => (
    <>
      <KeyRowType type={type} nameString={nameString} />
      <KeyRowName shortName={shortName} nameString={nameString} />
      {includeTTL && (
        <KeyRowTTL
          ttl={ttl}
          nameString={nameString}
          deletePopoverId={deletePopoverId}
          rowId={nodeId}
        />
      )}
      {includeSize && (
        <KeyRowSize
          size={size}
          nameString={nameString}
          deletePopoverId={deletePopoverId}
          rowId={nodeId}
        />
      )}
      <DeleteKeyPopover
        deletePopoverId={deletePopoverId === nodeId ? nodeId : undefined}
        nameString={nameString}
        name={nameBuffer}
        type={type}
        rowId={nodeId}
        deleting={deleting}
        onDelete={handleDelete}
        onOpenPopover={handleDeletePopoverOpen}
      />
    </>
  )

  const Node = (
    <div
      className={cx(styles.nodeContent, 'rowKey', {
        [styles.nodeContentOpen]: isOpen && !isLeaf,
      })}
      role="treeitem"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onFocus={() => {}}
      data-testid={`node-item_${fullName}${isOpen && !isLeaf ? '--expanded' : ''}`}
    >
      {!isLeaf && <Folder />}
      {isLeaf && <Leaf />}
    </div>
  )

  const tooltipContent = (
    <>
      <div className={styles.folderTooltipHeader}>
        <span
          className={styles.folderPattern}
        >{`${fullName + delimiterView}*`}</span>
        {delimiters.length > 1 && (
          <span className={styles.delimiters}>
            {delimiters.map((delimiter) => (
              <span className={styles.delimiter}>{delimiter}</span>
            ))}
          </span>
        )}
      </div>
      <span>{`${keyCount} key(s) (${Math.round(keyApproximate * 100) / 100}%)`}</span>
    </>
  )

  return (
    <div
      style={{
        ...style,
        paddingLeft:
          (nestingLevel > MAX_NESTING_LEVEL
            ? MAX_NESTING_LEVEL
            : nestingLevel) * 8,
      }}
      className={cx(styles.nodeContainer, {
        [styles.nodeSelected]: isSelected && isLeaf,
        [styles.nodeRowEven]: index % 2 === 0,
      })}
    >
      {Node}
    </div>
  )
}

export default Node
