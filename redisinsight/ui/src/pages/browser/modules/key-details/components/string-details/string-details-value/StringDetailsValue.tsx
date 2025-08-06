import React, {
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { DownloadIcon } from 'uiBase/icons'
import { RiSecondaryButton } from 'uiBase/forms'
import { RiText } from 'uiBase/text'
import { RiTextArea } from 'uiBase/inputs'
import { RiProgressBarLoader } from 'uiBase/display'
import {
  bufferToSerializedFormat,
  bufferToString,
  formattingBuffer,
  isEqualBuffers,
  isFormatEditable,
  isFullStringLoaded,
  isNonUnicodeFormatter,
  isTruncatedString,
  stringToBuffer,
  stringToSerializedBufferFormat,
} from 'uiSrc/utils'
import {
  fetchDownloadStringValue,
  resetStringValue,
  setIsStringCompressed,
  stringDataSelector,
  stringSelector,
  updateStringValueAction,
} from 'uiSrc/slices/browser/string'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'
import { AddStringFormConfig as config } from 'uiSrc/pages/browser/components/add-key/constants/fields-config'
import {
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import {
  KeyTypes,
  KeyValueFormat,
  ModulesKeyTypes,
  STRING_MAX_LENGTH,
  TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_FAILED_CONVENT_FORMATTER,
  TEXT_INVALID_VALUE,
  TEXT_UNPRINTABLE_CHARACTERS,
} from 'uiSrc/constants'
import { calculateTextareaLines } from 'uiSrc/utils/calculateTextareaLines'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { downloadFile } from 'uiSrc/utils/dom/downloadFile'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { IFetchKeyArgs } from 'uiSrc/constants/prop-types/keys'

import { RiTooltip } from 'uiSrc/components'
import styles from './styles.module.scss'

const MIN_ROWS = 8
const APPROXIMATE_WIDTH_OF_SIGN = 8.6
const MAX_LENGTH = STRING_MAX_LENGTH + 1

export interface Props {
  isEditItem: boolean
  setIsEdit: (isEdit: boolean) => void
  onRefresh: (
    key: RedisResponseBuffer,
    type: KeyTypes | ModulesKeyTypes,
    args: IFetchKeyArgs,
  ) => void
}

const StringDetailsValue = (props: Props) => {
  const { isEditItem, setIsEdit, onRefresh } = props

  const { compressor = null } = useSelector(connectedInstanceSelector)
  const { loading } = useSelector(stringSelector)
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { value: initialValue } = useSelector(stringDataSelector)
  const {
    name: key,
    type: keyType,
    length,
  } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { viewFormat: viewFormatProp } = useSelector(selectedKeySelector)
  const isTruncatedValue = isTruncatedString(initialValue)

  const [rows, setRows] = useState<number>(MIN_ROWS)
  const [value, setValue] = useState<JSX.Element | string>('')
  const [areaValue, setAreaValue] = useState<string>('')
  const [viewFormat, setViewFormat] = useState(viewFormatProp)
  const [isValid, setIsValid] = useState(true)
  const [isDisabled, setIsDisabled] = useState(false)
  const [isEditable, setIsEditable] = useState(true)
  const [noEditableText, setNoEditableText] = useState<string>(
    TEXT_DISABLED_COMPRESSED_VALUE,
  )

  const textAreaRef: Ref<HTMLTextAreaElement> = useRef(null)
  const viewValueRef: Ref<HTMLPreElement> = useRef(null)
  const containerRef: Ref<HTMLDivElement> = useRef(null)

  const dispatch = useDispatch()

  useEffect(
    () => () => {
      dispatch(resetStringValue())
    },
    [],
  )

  useEffect(() => {
    if (!initialValue) return

    const { value: decompressedValue, isCompressed } = decompressingBuffer(
      initialValue,
      compressor,
    )

    const initialValueString = bufferToString(decompressedValue, viewFormat)
    const fullStringLoaded = isFullStringLoaded(
      initialValue?.data?.length,
      length,
    )

    const { value: formattedValue, isValid } = formattingBuffer(
      decompressedValue,
      fullStringLoaded ? viewFormatProp : KeyValueFormat.Unicode,
      { expanded: true },
    )
    setAreaValue(initialValueString)

    setValue(!fullStringLoaded ? `${formattedValue}...` : formattedValue)
    setIsValid(isValid)
    setIsDisabled(
      !isNonUnicodeFormatter(viewFormatProp, isValid) &&
        !isEqualBuffers(initialValue, stringToBuffer(initialValueString)),
    )
    setIsEditable(
      !isCompressed &&
        !isTruncatedValue &&
        isFormatEditable(viewFormatProp) &&
        fullStringLoaded,
    )
    setNoEditableText(
      isCompressed
        ? TEXT_DISABLED_COMPRESSED_VALUE
        : isTruncatedValue
          ? TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA
          : TEXT_FAILED_CONVENT_FORMATTER(viewFormatProp),
    )

    dispatch(setIsStringCompressed(isCompressed))

    if (viewFormat !== viewFormatProp) {
      setViewFormat(viewFormatProp)
    }
  }, [initialValue, viewFormatProp, compressor, length])

  useEffect(() => {
    // Approximate calculation of textarea rows by initialValue
    if (!isEditItem || !textAreaRef.current || value === null) {
      return
    }
    const calculatedRows = calculateTextareaLines(
      areaValue,
      textAreaRef.current.clientWidth,
      APPROXIMATE_WIDTH_OF_SIGN,
    )
    if (calculatedRows > MIN_ROWS) {
      setRows(calculatedRows)
    }
  }, [viewValueRef, isEditItem])

  useMemo(() => {
    if (isEditItem && initialValue) {
      ;(document.activeElement as HTMLElement)?.blur()
      setAreaValue(bufferToSerializedFormat(viewFormat, initialValue, 4))
    }
  }, [isEditItem])

  const onApplyChanges = () => {
    const data = stringToSerializedBufferFormat(viewFormat, areaValue)
    const onSuccess = () => {
      setIsEdit(false)
      setValue(formattingBuffer(data, viewFormat, { expanded: true })?.value)
    }
    dispatch(updateStringValueAction(key, data, onSuccess))
  }

  const onDeclineChanges = useCallback(() => {
    if (!initialValue) return

    setAreaValue(bufferToSerializedFormat(viewFormat, initialValue, 4))
    setIsEdit(false)
  }, [initialValue])

  const isLoading = loading || value === null

  const handleLoadAll = (
    key: RedisResponseBuffer,
    type: KeyTypes | ModulesKeyTypes,
  ) => {
    const endString = length - 1
    onRefresh(key, type, { end: endString })
    sendEventTelemetry({
      event: TelemetryEvent.STRING_LOAD_ALL_CLICKED,
      eventData: {
        databaseId: instanceId,
        length,
      },
    })
  }

  const handleDownloadString = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    dispatch(fetchDownloadStringValue(key, downloadFile))
    sendEventTelemetry({
      event: TelemetryEvent.STRING_DOWNLOAD_VALUE_CLICKED,
      eventData: {
        databaseId: instanceId,
        length,
      },
    })
  }

  const renderValue = (value: string) => {
    const textEl = (
      <RiText
        className={styles.stringValue}
        onClick={() => isEditable && setIsEdit(true)}
        style={{ whiteSpace: 'break-spaces' }}
        data-testid="string-value"
      >
        {areaValue !== ''
          ? value
          : !isLoading && <span style={{ fontStyle: 'italic' }}>Empty</span>}
      </RiText>
    )

    return (
      <RiTooltip
        title={!isValid ? noEditableText : undefined}
        anchorClassName={styles.tooltipAnchor}
        className={styles.tooltip}
        position="left"
        data-testid="string-value-tooltip"
      >
        {textEl}
      </RiTooltip>
    )
  }

  return (
    <>
      <div
        className={styles.container}
        ref={containerRef}
        data-testid="string-details"
      >
        {isLoading && (
          <RiProgressBarLoader
            color="primary"
            data-testid="progress-key-string"
          />
        )}
        {!isEditItem && renderValue(value as string)}
        {isEditItem && (
          <InlineItemEditor
            controlsPosition="bottom"
            placeholder="Enter Value"
            fieldName="value"
            expandable
            isLoading={false}
            isDisabled={isDisabled}
            disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
            onDecline={onDeclineChanges}
            onApply={onApplyChanges}
            declineOnUnmount={false}
            approveText={TEXT_INVALID_VALUE}
            approveByValidation={() =>
              formattingBuffer(
                stringToSerializedBufferFormat(viewFormat, areaValue),
                viewFormat,
              )?.isValid
            }
          >
            <RiTextArea
              name="value"
              id="value"
              rows={rows}
              placeholder={config.value.placeholder}
              value={areaValue}
              onChange={setAreaValue}
              disabled={loading}
              ref={textAreaRef}
              style={{
                maxHeight: containerRef.current
                  ? containerRef.current?.clientHeight - 80
                  : '100%',
              }}
              data-testid="string-value"
            />
          </InlineItemEditor>
        )}
      </div>

      {length > MAX_LENGTH && (
        <div className="key-details-footer" key="key-details-footer">
          <RiRow justify="between" align="center">
            <RiFlexItem>
              {!isFullStringLoaded(initialValue?.data?.length, length) && (
                <RiSecondaryButton
                  className={styles.stringFooterBtn}
                  size="small"
                  data-testid="load-all-value-btn"
                  onClick={() => handleLoadAll(key, keyType)}
                >
                  Load all
                </RiSecondaryButton>
              )}
            </RiFlexItem>
            {!isTruncatedValue && (
              <RiFlexItem>
                <RiSecondaryButton
                  className={styles.stringFooterBtn}
                  size="small"
                  icon={DownloadIcon}
                  iconSide="right"
                  data-testid="download-all-value-btn"
                  onClick={handleDownloadString}
                  disabled={isTruncatedValue}
                >
                  Download
                </RiSecondaryButton>
              </RiFlexItem>
            )}
          </RiRow>
        </div>
      )}
    </>
  )
}

export { StringDetailsValue }
