import React, { useState } from 'react'
import { EditIcon } from 'uiSrc/components/base/icons'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import {
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
} from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import * as S from '../../Rejson.styles'

export interface Props {
  keyName: string
  selectedKey: string | RedisResponseBuffer
  path: string
  handleSubmitRemoveKey: (path: string, jsonKeyName: string) => void
  onClickEditEntireItem: () => void
  ['data-testid']?: string
}

const EditItemFieldAction = ({
  keyName,
  selectedKey,
  path,
  handleSubmitRemoveKey,
  onClickEditEntireItem,
  'data-testid': testId = 'edit-json-field',
}: Props) => {
  const [deleting, setDeleting] = useState<string>('')

  return (
    <S.ActionButtons>
      <IconButton
        icon={EditIcon}
        className={S.actionButtonsClassName}
        onClick={onClickEditEntireItem}
        aria-label="Edit field"
        size="S"
        data-testid={testId}
      />
      <PopoverDelete
        header={createDeleteFieldHeader(keyName)}
        text={createDeleteFieldMessage(bufferToString(selectedKey))}
        item={keyName}
        deleting={deleting}
        closePopover={() => setDeleting('')}
        updateLoading={false}
        showPopover={setDeleting}
        handleDeleteItem={() => handleSubmitRemoveKey(path, keyName)}
        testid="remove-json-field"
      />
    </S.ActionButtons>
  )
}

export default EditItemFieldAction
