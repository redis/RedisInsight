import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import { has } from 'lodash'

import { RiSpacer } from 'uiBase/layout/spacer'
import { RiTitle, RiText } from 'uiBase/text'
import { compareConsents } from 'uiSrc/utils'
import {
  updateUserConfigSettingsAction,
  userSettingsSelector,
} from 'uiSrc/slices/user/user-settings'
import ConsentOption from '../ConsentOption'
import { ConsentCategories, IConsent } from '../ConsentsSettings'

import styles from '../styles.module.scss'

const ConsentsPrivacy = () => {
  const [consents, setConsents] = useState<IConsent[]>([])
  const [privacyConsents, setPrivacyConsents] = useState<IConsent[]>([])
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
    setPrivacyConsents(
      consents.filter(
        (consent: IConsent) =>
          !consent.required &&
          consent.category === ConsentCategories.Privacy &&
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
  }

  const submitForm = (values: any) => {
    dispatch(updateUserConfigSettingsAction({ agreements: values }))
  }

  return (
    <form onSubmit={formik.handleSubmit} data-testid="consents-settings-form">
      <div className={styles.consentsWrapper}>
        <RiText size="s" className={styles.smallText} color="subdued">
          To optimize your experience, Redis Insight uses third-party tools.
        </RiText>
        <RiSpacer />
        <RiTitle size="XS">Usage Data</RiTitle>
        {privacyConsents.map((consent: IConsent) => (
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

export default ConsentsPrivacy
