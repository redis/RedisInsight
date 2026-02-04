import React, { useEffect, useState, useRef } from 'react'
import { NodePublicState } from 'react-vtree/dist/es/Tree'
import { useSelector } from 'react-redux'

import * as keys from 'uiSrc/constants/keys'
import { Maybe } from 'uiSrc/utils'
import { KeyTypes, ModulesKeyTypes, BrowserColumns } from 'uiSrc/constants'
import KeyRowTTL from 'uiSrc/pages/browser/components/key-row-ttl'
import KeyRowSize from 'uiSrc/pages/browser/components/key-row-size'
import KeyRowName from 'uiSrc/pages/browser/components/key-row-name'
import KeyRowType from 'uiSrc/pages/browser/components/key-row-type'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { appContextDbConfig } from 'uiSrc/slices/app/context'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components'
import { Flex, Row } from 'uiSrc/components/base/layout/flex'
import { ColorText, Text } from 'uiSrc/components/base/text'
import * as S from './Node.styles'
import { AnchorContent } from './Node.styles'
import { TreeData } from '../../interfaces'
import { DeleteKeyPopover } from '../../../delete-key-popover/DeleteKeyPopover'

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
  const tooltipContent = (
    <>
      <S.FolderTooltipHeader align="center" wrap>
        <ColorText
          size="M"
          variant="semiBold"
          color="secondary"
        >{`${fullName + delimiterView}*`}</ColorText>
        {delimiters.length > 1 && (
          <S.Delimiters>
            {delimiters.map((delimiter) => (
              <S.Delimiter key={delimiter}>{delimiter}</S.Delimiter>
            ))}
          </S.Delimiters>
        )}
      </S.FolderTooltipHeader>
      <span>{`${keyCount} key(s) (${Math.round(keyApproximate * 100) / 100}%)`}</span>
    </>
  )

  const Folder = () => (
    <S.AnchorTooltipNode align="center">
      <RiTooltip
        content={tooltipContent}
        anchorClassName="tooltip-anchor"
        position="bottom"
      >
        <S.AnchorContent align="center" full>
          <Row align="center" justify="start" gap="s">
            <S.NodeIconArrow>
              <RiIcon
                size="s"
                type={isOpen ? 'ChevronDownIcon' : 'ChevronRightIcon'}
                data-test-subj={`node-arrow-icon_${fullName}`}
              />
            </S.NodeIconArrow>
            <S.NodeIcon>
              <RiIcon
                size="s"
                type="FolderIcon"
                data-test-subj={`node-folder-icon_${fullName}`}
              />
            </S.NodeIcon>
            <Text
              color="secondary"
              ellipsis
              className="truncateText"
              data-testid={`folder-${nameString}`}
            >
              {nameString}
            </Text>
          </Row>
          <Row justify="end" grow={false} align="center">
            <S.Approximate
              color="secondary"
              data-testid={`percentage_${fullName}`}
            >
              {keyApproximate
                ? `${keyApproximate < 1 ? '<1' : Math.round(keyApproximate)}%`
                : ''}
            </S.Approximate>
            <S.KeyCount color="secondary" data-testid={`count_${fullName}`}>
              {keyCount ?? ''}
            </S.KeyCount>
          </Row>
        </S.AnchorContent>
      </RiTooltip>
    </S.AnchorTooltipNode>
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

  const NodeElement = (
    <S.NodeContent
      align="center"
      grow
      className="rowKey"
      $isOpen={isOpen}
      $isLeaf={isLeaf}
      justify="between"
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
      {NodeElement}
    </S.NodeContainer>
  )
}

export default Node
