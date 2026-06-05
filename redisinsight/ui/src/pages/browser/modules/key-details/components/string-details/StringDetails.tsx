import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import {
  initialKeyInfo,
  refreshKey,
  selectedKeyDataSelector,
  selectedKeySelector,
  setSelectedKeyRefreshDisabled,
} from 'uiSrc/slices/browser/keys'
import {
  KeyTypes,
  KeyValueCompressor,
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
  bufferToSerializedFormat,
  formattingBuffer,
  isTruncatedString,
  isFormatEditable,
  isFullStringLoaded,
  Nullable,
} from 'uiSrc/utils'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { CopyButton } from 'uiSrc/components/copy-button'
import { Row } from 'uiSrc/components/base/layout/flex'
import { StringDetailsValue } from './string-details-value'
import { EditItemAction } from '../key-details-actions'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'

export interface Props extends KeyDetailsHeaderProps {}

const StringDetails = (props: Props) => {
  const { onRemoveKey } = props
  const keyType = KeyTypes.String

  const { loading, viewFormat: viewFormatProp } =
    useAppSelector(selectedKeySelector)
  const { length } = useAppSelector(selectedKeyDataSelector) ?? initialKeyInfo
  const { value: keyValue } = useAppSelector(stringDataSelector)
  const { isCompressed: isStringCompressed } = useAppSelector(stringSelector)
  const { id: instanceId, compressor = null } = useAppSelector(
    connectedInstanceSelector,
  )

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

  // The full value can be copied as text only when it is entirely loaded and not
  // truncated. For large/lazy-loaded or truncated values the footer "Load all" /
  // "Download" controls remain the way to retrieve the complete value.
  const isFullyAvailable =
    isFullStringLoaded(keyValue?.data?.length, length) && !isTruncatedValue
  // Copy what is actually shown on screen. formattingBuffer is the same helper
  // the value panel uses: for text/decoded formats (Unicode, ASCII, HEX, Binary,
  // DateTime, …) it returns the displayed string, which we copy directly. For the
  // formats it renders as a JSON tree we fall back to the serialized text form.
  const decompressedValue = keyValue
    ? (decompressingBuffer(keyValue, compressor as Nullable<KeyValueCompressor>)
        .value as RedisResponseBuffer)
    : undefined
  const displayedValue = decompressedValue
    ? formattingBuffer(decompressedValue, viewFormatProp, { expanded: true })
        .value
    : ''
  const copyValue =
    typeof displayedValue === 'string'
      ? displayedValue
      : bufferToSerializedFormat(
          viewFormatProp,
          decompressedValue as RedisResponseBuffer,
          4,
        )

  const [editItem, setEditItem] = useState<boolean>(false)

  const dispatch = useAppDispatch()

  const handleCopyValue = () => {
    sendEventTelemetry({
      event: TelemetryEvent.STRING_VALUE_COPIED,
      eventData: { databaseId: instanceId },
    })
  }

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
    <Row align="center" gap="s" grow={false}>
      {keyValue && isFullyAvailable && (
        <CopyButton
          copy={copyValue}
          aria-label="Copy value"
          onCopy={handleCopyValue}
          data-testid="copy-string-value"
        />
      )}
      <EditItemAction
        title="Edit Value"
        tooltipContent={editToolTip}
        isEditable={isStringEditable && isEditable}
        onEditItem={() => {
          dispatch(setSelectedKeyRefreshDisabled(!editItem))
          setEditItem(!editItem)
        }}
      />
    </Row>
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
