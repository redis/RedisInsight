import React, { useEffect, useState, useRef } from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import cx from 'classnames'
import { useSelector } from 'react-redux'

import * as keys from 'uiSrc/constants/keys'
import { Maybe } from 'uiSrc/utils'
import {
  KeyTypes,
  ModulesKeyTypes,
  BrowserColumns,
  TEXT_BULK_DELETE_TOOLTIP,
  TEXT_BULK_DELETE_DISABLED_UNPRINTABLE,
  TEXT_BULK_DELETE_DISABLED_MULTIPLE_DELIMITERS,
} from 'uiSrc/constants'
import KeyRowTTL from 'uiSrc/pages/browser/components/key-row-ttl'
import KeyRowSize from 'uiSrc/pages/browser/components/key-row-size'
import KeyRowName from 'uiSrc/pages/browser/components/key-row-name'
import KeyRowType from 'uiSrc/pages/browser/components/key-row-type'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { DeleteKeyPopover } from '../../../delete-key-popover/DeleteKeyPopover'
import { TreeData } from '../../interfaces'
import styles from './styles.module.scss'
import { Flex, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import * as S from './Node.styles'

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
    onDeleteFolder,
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

  const deletePattern = `${fullName}${delimiterView}*`

  const handleDeleteFolder = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteFolder?.(deletePattern, fullName, keyCount)
  }

  // Check if folder name contains unprintable characters (Unicode replacement character)
  // These folders may group keys incorrectly, so bulk delete should be disabled
  const hasUnprintableChars =
    fullName?.includes('\uFFFD') || nameString?.includes('\uFFFD')

  // Check if delete should be disabled (multiple delimiters or unprintable chars)
  const isDeleteDisabled = delimiters.length > 1 || hasUnprintableChars

  const getDeleteTooltip = () => {
    if (hasUnprintableChars) {
      return TEXT_BULK_DELETE_DISABLED_UNPRINTABLE
    }
    if (delimiters.length > 1) {
      return TEXT_BULK_DELETE_DISABLED_MULTIPLE_DELIMITERS
    }
    return TEXT_BULK_DELETE_TOOLTIP(deletePattern)
  }
  const deleteTooltip = getDeleteTooltip()

  const Folder = () => (
    <RiTooltip
      content={tooltipContent}
      position="bottom"
      anchorClassName={styles.anchorTooltipNode}
    >
      <Row align="center">
        <Flex align="center">
          <RiIcon
            size="xs"
            type={isOpen ? 'ChevronDownIcon' : 'ChevronRightIcon'}
            className={cx(styles.nodeIcon, styles.nodeIconArrow)}
            data-test-subj={`node-arrow-icon_${fullName}`}
          />
          <RiIcon
            size="m"
            type="FolderIcon"
            className={styles.nodeIcon}
            data-test-subj={`node-folder-icon_${fullName}`}
          />
          <Text className="truncateText" data-testid={`folder-${nameString}`}>
            {nameString}
          </Text>
        </Flex>
        <S.FolderActions align="center" justify="end">
          <S.FolderApproximate data-testid={`percentage_${fullName}`}>
            {keyApproximate
              ? `${keyApproximate < 1 ? '<1' : Math.round(keyApproximate)}%`
              : ''}
          </S.FolderApproximate>
          <S.FolderKeyCount data-testid={`count_${fullName}`}>
            {keyCount ?? ''}
          </S.FolderKeyCount>
          <RiTooltip content={deleteTooltip} position="left">
            <IconButton
              icon={DeleteIcon}
              onClick={handleDeleteFolder}
              disabled={isDeleteDisabled}
              className="showOnHoverKey"
              aria-label="Delete Folder Keys"
              data-testid={`delete-folder-btn-${fullName}`}
            />
          </RiTooltip>
        </S.FolderActions>
      </Row>
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
