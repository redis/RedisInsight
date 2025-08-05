import React, { useState } from 'react'
import { EditIcon } from 'uiSrc/components/base/icons'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import {
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
} from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { RiIconButton } from 'uiSrc/components/base/forms'
import styles from '../../styles.module.scss'

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
    <div className={styles.actionButtons}>
      <RiIconButton
        icon={EditIcon}
        className={styles.jsonButtonStyle}
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
    </div>
  )
}

export default EditItemFieldAction
