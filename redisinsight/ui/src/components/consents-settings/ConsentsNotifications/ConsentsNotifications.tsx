import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import { has } from 'lodash'

import { compareConsents } from 'uiSrc/utils'
import {
  updateUserConfigSettingsAction,
  userSettingsSelector,
} from 'uiSrc/slices/user/user-settings'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Title } from 'uiSrc/components/base/text/Title'
import ConsentOption from '../ConsentOption'
import { IConsent, ConsentCategories } from '../ConsentsSettings'

import styles from '../styles.module.scss'

export interface Props {
  onSubmitted?: () => void
}

const ConsentsNotifications = () => {
  const [consents, setConsents] = useState<IConsent[]>([])
  const [notificationConsents, setNotificationConsents] = useState<IConsent[]>(
    [],
  )
  const [initialValues, setInitialValues] = useState<any>({})

  const { config, spec } = useSelector(userSettingsSelector)

  const dispatch = useDispatch()

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    },
  })

  useEffect(() => {
    if (spec && config) {
      setConsents(compareConsents(spec?.agreements, config?.agreements, true))
    }
  }, [spec, config])

  useEffect(() => {
    setNotificationConsents(
      consents.filter(
        (consent: IConsent) =>
          !consent.required &&
          consent.category === ConsentCategories.Notifications &&
          consent.displayInSetting,
      ),
    )
    if (consents.length) {
      const values = consents.reduce(
        (acc: any, cur: IConsent) => ({
          ...acc,
          [cur.agreementName]: cur.defaultValue,
        }),
        {},
      )

      if (config) {
        Object.keys(values).forEach((value) => {
          if (has(config.agreements, value)) {
            values[value] = config?.agreements?.[value]
          }
        })
      }
      setInitialValues(values)
    }
  }, [consents])

  const onChangeAgreement = (checked: boolean, name: string) => {
    formik.setFieldValue(name, checked)
    formik.submitForm()
    sendEventTelemetry({
      event: checked
        ? TelemetryEvent.SETTINGS_NOTIFICATION_MESSAGES_ENABLED
        : TelemetryEvent.SETTINGS_NOTIFICATION_MESSAGES_DISABLED,
    })
  }

  const submitForm = (values: any) => {
    dispatch(updateUserConfigSettingsAction({ agreements: values }))
  }

  return (
    <form onSubmit={formik.handleSubmit} data-testid="consents-settings-form">
      <div className={styles.consentsWrapper}>
        <Title size="XS">Notifications</Title>
        {notificationConsents.map((consent: IConsent) => (
          <ConsentOption
            consent={consent}
            checked={formik.values[consent.agreementName] ?? false}
            onChangeAgreement={onChangeAgreement}
            isSettingsPage
            key={consent.agreementName}
          />
        ))}
      </div>
    </form>
  )
}

export default ConsentsNotifications
