import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'

import { TimezoneOption, timezoneOptions } from 'uiSrc/constants'
import {
  updateUserConfigSettingsAction,
  userSettingsConfigSelector,
} from 'uiSrc/slices/user/user-settings'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import {
  defaultValueRender,
  RiSelect,
} from 'uiSrc/components/base/forms/select/RiSelect'

interface InitialValuesType {
  timezone: TimezoneOption
}

const TimezoneForm = () => {
  const config = useSelector(userSettingsConfigSelector)
  const dispatch = useDispatch()

  const getInitialValues: InitialValuesType = useMemo(
    () => ({ timezone: config?.timezone || TimezoneOption.Local }),
    [config?.timezone],
  )

  const formik = useFormik({
    initialValues: getInitialValues,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    },
  })

  const submitForm = async (values: InitialValuesType) => {
    dispatch(
      updateUserConfigSettingsAction(
        { timezone: values.timezone.trim() },
        () => {
          formik.setSubmitting(false)
        },
        () => {
          formik.setSubmitting(false)
        },
      ),
    )
  }

  const onTimezoneChange = (value: string) => {
    formik.setFieldValue('timezone', value)

    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_TIME_ZONE_CHANGED,
      eventData: {
        currentTimezone: value,
      },
    })
    formik.handleSubmit()
  }

  return (
    <form onSubmit={formik.handleSubmit} data-testid="format-timezone-form">
      <div>
        <RiSelect
          style={{ width: 240 }}
          options={timezoneOptions.map((option) => ({
            ...option,
            'data-test-subj': `zone-option-${option.value}`,
          }))}
          value={formik.values.timezone}
          valueRender={defaultValueRender}
          onChange={(option) => onTimezoneChange(option)}
          data-test-subj="select-timezone"
        />
      </div>
    </form>
  )
}

export default TimezoneForm
