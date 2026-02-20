import React, { useEffect, useRef, useState } from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import { useSelector } from 'react-redux'

import * as keys from 'uiSrc/constants/keys'
import { Maybe } from 'uiSrc/utils'
import {
  BrowserColumns,
  FeatureFlags,
  KeyTypes,
  ModulesKeyTypes,
  TEXT_BULK_DELETE_DISABLED_MULTIPLE_DELIMITERS,
  TEXT_BULK_DELETE_DISABLED_UNPRINTABLE,
  TEXT_BULK_DELETE_TOOLTIP,
} from 'uiSrc/constants'
import KeyRowTTL from 'uiSrc/pages/browser/components/key-row-ttl'
import KeyRowSize from 'uiSrc/pages/browser/components/key-row-size'
import KeyRowName from 'uiSrc/pages/browser/components/key-row-name'
import KeyRowType from 'uiSrc/pages/browser/components/key-row-type'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { FeatureFlagComponent, RiTooltip } from 'uiSrc/components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { DeleteIcon } from 'uiSrc/components/base/icons'
import { Flex } from 'uiSrc/components/base/layout/flex'
import { ColorText, Text } from 'uiSrc/components/base/text'
import * as S from './Node.styles'
import { TreeData } from '../../VirtualTree.types'
import { DeleteKeyPopover } from '../../../delete-key-popover/DeleteKeyPopover'

const MAX_NESTING_LEVEL = 20

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
    visibleColumns: visibleColumnsProp,
    showFolderMetadata: showFolderMetadataProp = true,
    showSelectedIndicator: showSelectedIndicatorProp = false,
  } = data

  const delimiterView = delimiters.length === 1 ? delimiters[0] : '-'

  const { shownColumns } = useSelector(appContextDbConfig)
  const visibleColumns = visibleColumnsProp ?? shownColumns
  const includeSize = visibleColumns.includes(BrowserColumns.Size)
  const includeTTL = visibleColumns.includes(BrowserColumns.TTL)

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

  const hasUnprintableChars =
    fullName?.includes('\uFFFD') || nameString?.includes('\uFFFD')

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

  const folderTextColor = isOpen ? 'primary' : 'secondary'

  const Folder = () => (
    <RiTooltip
      content={tooltipContent}
      position="bottom"
      anchorClassName={S.FOLDER_ANCHOR_CLASS}
    >
      <S.FolderContent align="center">
        <Flex align="center">
          <S.NodeIconArrow>
            <RiIcon
              size="xs"
              type={isOpen ? 'ChevronDownIcon' : 'ChevronRightIcon'}
              data-test-subj={`node-arrow-icon_${fullName}`}
            />
          </S.NodeIconArrow>
          <S.NodeIcon>
            <RiIcon
              size="m"
              type="FolderIcon"
              data-test-subj={`node-folder-icon_${fullName}`}
            />
          </S.NodeIcon>
          <Text
            color={folderTextColor}
            className="truncateText"
            data-testid={`folder-${nameString}`}
          >
            {nameString}
          </Text>
        </Flex>
        {showFolderMetadataProp && (
          <S.FolderActions align="center" justify="end">
            <S.FolderApproximate data-testid={`percentage_${fullName}`}>
              <ColorText color="secondary">
                {keyApproximate
                  ? `${keyApproximate < 1 ? '<1' : Math.round(keyApproximate)}%`
                  : ''}
              </ColorText>
            </S.FolderApproximate>
            <S.FolderKeyCount data-testid={`count_${fullName}`}>
              <ColorText color="secondary">{keyCount ?? ''}</ColorText>
            </S.FolderKeyCount>
            <FeatureFlagComponent name={FeatureFlags.envDependent}>
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
            </FeatureFlagComponent>
          </S.FolderActions>
        )}
      </S.FolderContent>
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
      {showFolderMetadataProp && (
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
      )}
      {showSelectedIndicatorProp && isSelected && (
        <RiIcon
          size="m"
          type="ChevronRightIcon"
          data-testid={`selected-indicator_${fullName}`}
        />
      )}
    </>
  )

  const NodeItem = (
    <S.NodeContent
      role="treeitem"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      onFocus={() => {}}
      data-testid={`node-item_${fullName}${isOpen && !isLeaf ? '--expanded' : ''}`}
    >
      {!isLeaf && <Folder />}
      {isLeaf && <Leaf />}
    </S.NodeContent>
  )

  const tooltipContent = (
    <>
      <S.FolderTooltipHeader>
        <S.FolderPattern>{`${fullName + delimiterView}*`}</S.FolderPattern>
        {delimiters.length > 1 && (
          <S.Delimiters>
            {delimiters.map((delimiter) => (
              <S.Delimiter key={delimiter}>{delimiter}</S.Delimiter>
            ))}
          </S.Delimiters>
        )}
      </S.FolderTooltipHeader>
      <ColorText color="secondary">
        {`${keyCount} key(s) (${Math.round(keyApproximate * 100) / 100}%)`}
      </ColorText>
    </>
  )

  return (
    <S.NodeContainer
      style={{
        ...style,
        paddingLeft:
          (nestingLevel > MAX_NESTING_LEVEL
            ? MAX_NESTING_LEVEL
            : nestingLevel) * 8,
      }}
      $isSelected={isSelected && isLeaf}
      $isEven={index % 2 === 0}
    >
      {NodeItem}
    </S.NodeContainer>
  )
}

export default Node
