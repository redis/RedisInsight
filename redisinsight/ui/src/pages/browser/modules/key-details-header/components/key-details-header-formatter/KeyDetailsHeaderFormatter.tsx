import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { RiText } from 'uiBase/text'
import {
  KeyTypes,
  KeyValueFormat,
  MIDDLE_SCREEN_RESOLUTION,
  TEXT_DISABLED_STRING_FORMATTING,
  Theme,
} from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import {
  keysSelector,
  selectedKeyDataSelector,
  selectedKeySelector,
  setViewFormat,
} from 'uiSrc/slices/browser/keys'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { stringDataSelector } from 'uiSrc/slices/browser/string'
import { isFullStringLoaded } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import {
  Container,
  ControlsIcon,
  KeyDetailsSelect,
  OptionText,
} from 'uiSrc/pages/browser/modules/key-details-header/components/key-details-header-formatter/KeyDetailsHeaderFormatter.styles'
import { getKeyValueFormatterOptions } from './constants'

export interface Props {
  width: number
}
const KeyDetailsHeaderFormatter = (props: Props) => {
  const { width } = props

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { theme } = useContext(ThemeContext)
  const { viewType } = useSelector(keysSelector)
  const { viewFormat } = useSelector(selectedKeySelector)
  const { type: keyType, length } = useSelector(selectedKeyDataSelector) ?? {}
  const { value: keyValue } = useSelector(stringDataSelector)

  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)
  const [typeSelected, setTypeSelected] = useState<KeyValueFormat>(viewFormat)
  const [options, setOptions] = useState<any[]>([])

  const dispatch = useDispatch()

  const isStringFormattingEnabled =
    keyType === KeyTypes.String
      ? isFullStringLoaded(keyValue?.data?.length, length)
      : true

  useEffect(() => {
    const newOptions = getKeyValueFormatterOptions(keyType).map(
      ({ value, text }) => ({
        value,
        label: value,
        inputDisplay: (
          <RiTooltip
            data-test-subj={`format-option-${value}`}
            content={
              !isStringFormattingEnabled
                ? TEXT_DISABLED_STRING_FORMATTING
                : typeSelected
            }
            position="top"
            anchorClassName="flex-row"
          >
            <>
              {width >= MIDDLE_SCREEN_RESOLUTION ? (
                <OptionText color="subdued">{text}</OptionText>
              ) : (
                <ControlsIcon
                  type={
                    theme === Theme.Dark
                      ? 'FormattersDarkIcon'
                      : 'FormattersLightIcon'
                  }
                  data-testid={`key-value-formatter-option-selected-${value}`}
                />
              )}
            </>
          </RiTooltip>
        ),
        dropdownDisplay: (
          <RiText
            component="span"
            size="s"
            data-test-subj={`format-option-${value}`}
          >
            {text}
          </RiText>
        ),
      }),
    )

    setOptions(newOptions)
  }, [viewFormat, keyType, width, isStringFormattingEnabled])

  const onChangeType = (value: KeyValueFormat) => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_DETAILS_FORMATTER_CHANGED,
        TelemetryEvent.TREE_VIEW_KEY_DETAILS_FORMATTER_CHANGED,
      ),
      eventData: {
        keyType,
        databaseId: instanceId,
        fromFormatter: viewFormat,
        toFormatter: value,
      },
    })

    setTypeSelected(value)
    setIsSelectOpen(false)
    dispatch(setViewFormat(value))
  }

  if (!options.length) {
    return null
  }

  return (
    <Container className={width >= MIDDLE_SCREEN_RESOLUTION ? 'fullWidth' : ''}>
      <div className="selectWrapper">
        <KeyDetailsSelect
          $fullWidth={width >= MIDDLE_SCREEN_RESOLUTION}
          disabled={!isStringFormattingEnabled}
          defaultOpen={isSelectOpen}
          options={options}
          valueRender={({ option, isOptionValue }) => {
            if (isOptionValue) {
              return option.dropdownDisplay as JSX.Element
            }
            return option.inputDisplay as JSX.Element
          }}
          value={typeSelected}
          onChange={(value: any) => onChangeType(value)}
          data-testid="select-format-key-value"
        />
      </div>
    </Container>
  )
}

export { KeyDetailsHeaderFormatter }
