import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  initialKeyInfo,
  refreshKey,
  selectedKeyDataSelector,
  selectedKeySelector,
  setSelectedKeyRefreshDisabled,
} from 'uiSrc/slices/browser/keys'
import {
  KeyTypes,
  ModulesKeyTypes,
  TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_DISABLED_FORMATTER_EDITING,
  TEXT_DISABLED_STRING_EDITING,
} from 'uiSrc/constants'

import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { IFetchKeyArgs } from 'uiSrc/constants/prop-types/keys'
import {
  resetStringValue,
  stringDataSelector,
  stringSelector,
} from 'uiSrc/slices/browser/string'
import {
  isTruncatedString,
  isFormatEditable,
  isFullStringLoaded,
} from 'uiSrc/utils'
import { StringDetailsValue } from './string-details-value'
import { EditItemAction } from '../key-details-actions'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'

export interface Props extends KeyDetailsHeaderProps {}

const StringDetails = (props: Props) => {
  const { onRemoveKey } = props
  const keyType = KeyTypes.String

  const { loading, viewFormat: viewFormatProp } =
    useSelector(selectedKeySelector)
  const { length } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo
  const { value: keyValue } = useSelector(stringDataSelector)
  const { isCompressed: isStringCompressed } = useSelector(stringSelector)

  const isTruncatedValue = isTruncatedString(keyValue)
  const isEditable =
    !isTruncatedValue && !isStringCompressed && isFormatEditable(viewFormatProp)
  const isStringEditable = isFullStringLoaded(keyValue?.data?.length, length)
  const noEditableText = isTruncatedValue
    ? TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA
    : isStringCompressed
      ? TEXT_DISABLED_COMPRESSED_VALUE
      : TEXT_DISABLED_FORMATTER_EDITING
  const editToolTip = !isEditable
    ? noEditableText
    : !isStringEditable
      ? TEXT_DISABLED_STRING_EDITING
      : null

  const [editItem, setEditItem] = useState<boolean>(false)

  const dispatch = useDispatch()

  const handleRefreshKey = (
    key: RedisResponseBuffer,
    type: KeyTypes | ModulesKeyTypes,
    args: IFetchKeyArgs,
  ) => {
    dispatch(refreshKey(key, type, args))
  }

  const handleRemoveKey = () => {
    dispatch(resetStringValue())
    onRemoveKey()
  }

  const Actions = () => (
    <EditItemAction
      title="Edit Value"
      tooltipContent={editToolTip}
      isEditable={isStringEditable && isEditable}
      onEditItem={() => {
        dispatch(setSelectedKeyRefreshDisabled(!editItem))
        setEditItem(!editItem)
      }}
    />
  )

  return (
    <div className="fluid flex-column relative">
      <KeyDetailsHeader
        {...props}
        key="key-details-header"
        onRemoveKey={handleRemoveKey}
      />
      <KeyDetailsSubheader keyType={keyType} Actions={Actions} />
      <div className="key-details-body" key="key-details-body">
        {!loading && (
          <div className="flex-column" style={{ flex: '1', height: '100%' }}>
            <StringDetailsValue
              isEditItem={editItem}
              setIsEdit={(isEdit: boolean) => {
                setEditItem(isEdit)
                dispatch(setSelectedKeyRefreshDisabled(isEdit))
              }}
              onRefresh={handleRefreshKey}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export { StringDetails }
