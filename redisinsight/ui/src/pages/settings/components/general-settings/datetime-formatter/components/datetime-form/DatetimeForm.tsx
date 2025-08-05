import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import { checkDateTimeFormat, formatTimestamp } from 'uiSrc/utils'
import {
  DATETIME_FORMATTER_DEFAULT,
  dateTimeOptions,
  DatetimeRadioOption,
  TimezoneOption,
} from 'uiSrc/constants'
import {
  updateUserConfigSettingsAction,
  userSettingsConfigSelector,
} from 'uiSrc/slices/user/user-settings'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  RiPrimaryButton,
  RiRadioGroup,
  defaultValueRender,
  RiSelect,
} from 'uiSrc/components/base/forms'
import { InfoIcon, CheckBoldIcon } from 'uiSrc/components/base/icons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { RiTooltip } from 'uiSrc/components'
import { TextInput } from 'uiSrc/components/base/inputs'

interface InitialValuesType {
  format: string
  customFormat: string
  commonFormat: string
  selectedRadioOption: DatetimeRadioOption
}

export interface Props {
  onFormatChange: (newPreview: string) => void
}

const DatetimeForm = ({ onFormatChange }: Props) => {
  const [error, setError] = useState('')
  const [saveFormatSucceed, setSaveFormatSucceed] = useState(false)
  const config = useSelector(userSettingsConfigSelector)
  const dispatch = useDispatch()

  const getInitialDateTime = (): InitialValuesType => {
    const format = config?.dateFormat || DATETIME_FORMATTER_DEFAULT
    const selectedRadioOption = dateTimeOptions.some(
      (opt) => opt.value === format,
    )
      ? DatetimeRadioOption.Common
      : DatetimeRadioOption.Custom

    return {
      selectedRadioOption,
      format,
      customFormat:
        selectedRadioOption === DatetimeRadioOption.Custom ? format : '',
      commonFormat:
        selectedRadioOption === DatetimeRadioOption.Common
          ? format
          : dateTimeOptions[0].value,
    }
  }

  const getInitialValues = useMemo(() => getInitialDateTime(), [config])

  const formik = useFormik({
    initialValues: getInitialValues,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    },
  })

  const submitForm = async (values: InitialValuesType) => {
    if (checkDateTimeFormat(values.format).valid) {
      dispatch(
        updateUserConfigSettingsAction(
          { dateFormat: values.format.trim() },
          () => {
            formik.setSubmitting(false)
            setTimeout(() => setSaveFormatSucceed(false), 5000)
          },
          () => {
            formik.setSubmitting(false)
          },
        ),
      )
    } else {
      setError('This format is not supported.')
      formik.setSubmitting(false)
    }
  }

  const showError = !!error || !formik.values.customFormat
  const getBtnIconType = () =>
    !showError
      ? InfoIcon
      : !formik.isSubmitting && saveFormatSucceed
        ? CheckBoldIcon
        : undefined

  const handleFormatCheck = (format = formik.values.format) => {
    const { valid, error: errorMsg } = checkDateTimeFormat(format)
    if (format.length > 50) {
      setError('Format should not exceed 50 characters')
    } else if (!valid) {
      setError(errorMsg || 'This format is not supported')
      onFormatChange?.('Invalid Format')
    } else {
      setError('')
      const newPreview = formatTimestamp(
        new Date(),
        format,
        config?.timezone || TimezoneOption.Local,
      )
      onFormatChange?.(newPreview)
    }
    return valid
  }

  const onRadioOptionChange = (id: string) => {
    formik.setFieldValue('selectedRadioOption', id)
    if (id === DatetimeRadioOption.Custom) {
      formik.setFieldValue('customFormat', formik.values.format)
    } else {
      formik.setFieldValue('format', formik.values.commonFormat)
      sendEventTelemetry({
        event: TelemetryEvent.SETTINGS_DATE_TIME_FORMAT_CHANGED,
        eventData: {
          currentFormat: formik.values.commonFormat,
        },
      })
      formik.handleSubmit()
    }
  }

  const onCustomFormatChange = (value: string) => {
    formik.setFieldValue('customFormat', value)
    formik.setFieldValue('format', value)
    handleFormatCheck(value)
  }

  const onCommonFormatChange = (value: string) => {
    formik.setFieldValue('commonFormat', value)
    formik.setFieldValue('format', value)

    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_DATE_TIME_FORMAT_CHANGED,
      eventData: {
        currentFormat: value,
      },
    })
    formik.handleSubmit()
  }

  const onCustomFormatSubmit = () => {
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_DATE_TIME_FORMAT_CHANGED,
      eventData: {
        currentFormat: formik.values.customFormat,
      },
    })
    setSaveFormatSucceed(true)
    formik.handleSubmit()
  }

  const dateTimeFormatOptions = [
    {
      value: DatetimeRadioOption.Common,
      label: 'Pre-selected formats',
    },
    {
      value: DatetimeRadioOption.Custom,
      label: 'Custom',
    },
  ]

  return (
    <form onSubmit={formik.handleSubmit} data-testid="format-timestamp-form">
      <RiRadioGroup
        items={dateTimeFormatOptions}
        id="datetime-format"
        data-testid="format-timestamp-form-radio-group"
        value={formik.values.selectedRadioOption}
        onChange={(id) => onRadioOptionChange(id)}
      />
      <Row gap="m" style={{ height: 50 }}>
        {formik.values.selectedRadioOption === DatetimeRadioOption.Common && (
          <RiSelect
            style={{ width: 240 }}
            options={dateTimeOptions.map((option) => ({
              ...option,
              'data-test-subj': `date-option-${option.value}`,
            }))}
            valueRender={defaultValueRender}
            value={formik.values.commonFormat}
            onChange={(option) => onCommonFormatChange(option)}
            disabled={
              formik.values.selectedRadioOption !== DatetimeRadioOption.Common
            }
            data-test-subj="select-datetime"
            data-testid="select-datetime-testid"
          />
        )}
        {formik.values.selectedRadioOption === DatetimeRadioOption.Custom && (
          <>
            <FlexItem grow={false}>
              <TextInput
                style={{ width: 240 }}
                id="customFormat"
                name="customFormat"
                value={formik.values.customFormat}
                onChange={(value) => onCustomFormatChange(value)}
                data-testid="custom-datetime-input"
              />
            </FlexItem>
            <RiTooltip
              position="top"
              anchorClassName="euiToolTip__btn-disabled"
              content={
                showError ? error || 'This format is not supported' : null
              }
            >
              <RiPrimaryButton
                aria-label="Save"
                loading={formik.isSubmitting}
                onClick={onCustomFormatSubmit}
                data-testid="datetime-custom-btn"
                icon={getBtnIconType()}
                disabled={showError}
              >
                Save
              </RiPrimaryButton>
            </RiTooltip>
          </>
        )}
      </Row>
    </form>
  )
}

export default DatetimeForm
