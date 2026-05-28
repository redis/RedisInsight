import React from 'react'

import { KeyValueFormat } from 'uiSrc/constants'
import HelpTexts from 'uiSrc/constants/help-texts'
import { Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { SearchIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import {
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
} from 'uiSrc/utils'

import {
  VectorSetActionsConfig,
  VectorSetActionTarget,
} from '../../VectorSetElementList.types'
import * as S from './RowActionsCell.styles'

export interface RowActionsCellProps {
  target: VectorSetActionTarget
  actionsConfig: VectorSetActionsConfig
  viewFormat: KeyValueFormat
  /** Prefix for the action button `data-testid`s (e.g. `vector-set` or `vector-set-similarity`). */
  testIdPrefix: string
}

export const RowActionsCell = ({
  target,
  actionsConfig,
  viewFormat,
  testIdPrefix,
}: RowActionsCellProps) => {
  const { name: nameBuffer } = target
  const { elementDeleteConfig, onViewElement, onSearchByElement } =
    actionsConfig
  const {
    deleting,
    suffix,
    total,
    keyName,
    closePopover,
    showPopover,
    handleDeleteElement,
    handleRemoveIconClick,
  } = elementDeleteConfig

  const name = bufferToString(nameBuffer, viewFormat)

  return (
    <Row gap="s" align="center" justify="center">
      <S.ActionTextButton
        onClick={() => onViewElement(target)}
        data-testid={`${testIdPrefix}-view-btn-${name}`}
        variant="primary-inline"
        color="informative400"
      >
        View
      </S.ActionTextButton>
      <RiTooltip content="Find similar elements" position="top">
        <IconButton
          size="S"
          icon={SearchIcon}
          onClick={() => onSearchByElement(target)}
          aria-label="Find similar elements"
          data-testid={`${testIdPrefix}-search-similar-btn-${name}`}
        />
      </RiTooltip>
      <PopoverDelete
        header={createDeleteFieldHeader(nameBuffer)}
        text={createDeleteFieldMessage(keyName)}
        item={name}
        itemRaw={nameBuffer}
        suffix={suffix}
        deleting={deleting}
        closePopover={closePopover}
        updateLoading={false}
        showPopover={showPopover}
        handleDeleteItem={handleDeleteElement}
        handleButtonClick={handleRemoveIconClick}
        testid={`${testIdPrefix}-remove-btn-${name}`}
        appendInfo={total === 1 ? HelpTexts.REMOVE_LAST_ELEMENT() : null}
      />
    </Row>
  )
}
