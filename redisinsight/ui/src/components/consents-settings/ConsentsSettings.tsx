import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FormikErrors, useFormik } from 'formik'
import { isEmpty, forEach } from 'lodash'
import cx from 'classnames'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiPrimaryButton } from 'uiBase/forms'
import { InfoIcon } from 'uiBase/icons'
import { RiTitle, RiText } from 'uiBase/text'
import { RiSwitchInput } from 'uiBase/inputs'
import { RiLink } from 'uiBase/display'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  updateUserConfigSettingsAction,
  userSettingsSelector,
} from 'uiSrc/slices/user/user-settings'
import { compareConsents } from 'uiSrc/utils'
import { RiHorizontalRule, RiTooltip } from 'uiSrc/components'
import ConsentOption from './ConsentOption'

import styles from './styles.module.scss'

interface Values {
  [key: string]: string
}

export interface IConsent {
  defaultValue: boolean
  displayInSetting: boolean
  required: boolean
  editable: boolean
  disabled: boolean
  linkToPrivacyPolicy: boolean
  category?: string
  since: string
  title: string
  label: string
  agreementName: string
  description?: string
}

export enum ConsentCategories {
  Notifications = 'notifications',
  Privacy = 'privacy',
}

export interface Props {
  onSubmitted?: () => void
}

const ConsentsSettings = ({ onSubmitted }: Props) => {
  const [consents, setConsents] = useState<IConsent[]>([])
  const [privacyConsents, setPrivacyConsents] = useState<IConsent[]>([])
  const [notificationConsents, setNotificationConsents] = useState<IConsent[]>(
    [],
  )
  const [requiredConsents, setRequiredConsents] = useState<IConsent[]>([])
  const [initialValues, setInitialValues] = useState<any>({})
  const [errors, setErrors] = useState<FormikErrors<Values>>({})
  const [isRecommended, setIsRecommended] = useState<boolean>(false)
  const [valuesBuffer, setValuesBuffer] = useState<Values>({})

  const { config, spec } = useSelector(userSettingsSelector)

  const dispatch = useDispatch()

  const submitIsDisabled = () => !isEmpty(errors)

  const validate = (values: any) => {
    const errs: FormikErrors<any> = {}
    requiredConsents.forEach((consent) => {
      if (!values[consent.agreementName]) {
        errs[consent.agreementName] = consent.agreementName
      }
    })
    setErrors(errs)
    return errs
  }

  const selectAll = (checked: boolean) => {
    setIsRecommended(checked)

    if (checked) {
      const newBufferValues: Values = {}
      consents.forEach((consent) => {
        if (!consent.required && !consent.disabled) {
          newBufferValues[consent.agreementName] =
            formik.values[consent.agreementName]
          formik.setFieldValue(consent.agreementName, true)
        }
        setValuesBuffer(newBufferValues)
      })
    } else {
      consents.forEach((consent) => {
        if (!consent.required && !consent.disabled) {
          formik.setFieldValue(
            consent.agreementName,
            valuesBuffer[consent.agreementName],
          )
        }
      })
    }
  }

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
    onSubmit: (values) => {
      submitForm(values)
    },
  })

  useEffect(() => {
    if (spec && config) {
      setConsents(compareConsents(spec?.agreements, config?.agreements))
    }
  }, [spec, config])

  useEffect(() => {
    if (!isRecommended) {
      setValuesBuffer({})
    }
  }, [isRecommended])

  useEffect(() => {
    setRequiredConsents(
      consents.filter((consent: IConsent) => consent.required),
    )
    setPrivacyConsents(
      consents.filter(
        (consent: IConsent) =>
          !consent.required && consent.category === ConsentCategories.Privacy,
      ),
    )
    setNotificationConsents(
      consents.filter(
        (consent: IConsent) =>
          !consent.required &&
          consent.category === ConsentCategories.Notifications,
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

      setInitialValues(values)
    }
  }, [consents])

  useEffect(() => {
    formik.validateForm(initialValues)
  }, [requiredConsents])

  useEffect(() => {
    setIsRecommended(checkIsRecommended())
  }, [formik.values])

  const checkIsRecommended = () => {
    let recommended = true
    forEach(privacyConsents, (consent) => {
      if (!formik.values[consent?.agreementName] && !consent.disabled) {
        recommended = false
        return false
      }
      return true
    })

    forEach(notificationConsents, (consent) => {
      if (!formik.values[consent?.agreementName] && !consent.disabled) {
        recommended = false
        return false
      }
      return true
    })

    return recommended
  }

  const onChangeAgreement = (checked: boolean, name: string) => {
    formik.setFieldValue(name, checked)
  }

  const submitForm = (values: any) => {
    if (submitIsDisabled()) {
      return
    }
    // have only one switcher in notificationConsents
    if (notificationConsents.length) {
      sendEventTelemetry({
        event: values[notificationConsents[0]?.agreementName]
          ? TelemetryEvent.SETTINGS_NOTIFICATION_MESSAGES_ENABLED
          : TelemetryEvent.SETTINGS_NOTIFICATION_MESSAGES_DISABLED,
      })
    }
    const settings: Record<string, any> = { agreements: values }
    if (values.analytics) {
      settings.analyticsReason = 'user'
    }
    dispatch(updateUserConfigSettingsAction(settings, onSubmitted))
  }

  return (
    <form onSubmit={formik.handleSubmit} data-testid="consents-settings-form">
      <div className={styles.consentsWrapper}>
        <RiSpacer size="m" />
        {consents.length > 1 && (
          <>
            <RiFlexItem>
              <RiRow gap="m">
                <RiFlexItem>
                  <RiSwitchInput
                    checked={isRecommended}
                    onCheckedChange={selectAll}
                    data-testid="switch-option-recommended"
                  />
                </RiFlexItem>
                <RiFlexItem>
                  <RiText className={styles.label}>
                    Use recommended settings
                  </RiText>
                  <RiText
                    size="s"
                    className={styles.smallText}
                    color="subdued"
                    style={{ marginTop: '12px' }}
                  >
                    Select to activate all listed options.
                  </RiText>
                </RiFlexItem>
              </RiRow>
            </RiFlexItem>
            <RiHorizontalRule
              margin="l"
              className={cx({
                [styles.pluginWarningHR]: !!requiredConsents.length,
              })}
            />
          </>
        )}
        {!!privacyConsents.length && (
          <>
            <RiSpacer />
            <RiTitle size="M" className={styles.title}>
              Privacy Settings
            </RiTitle>
            <RiSpacer size="m" />
            <RiText className={styles.smallText} size="s" color="subdued">
              To optimize your experience, Redis Insight uses third-party tools.
            </RiText>
            <RiSpacer />
          </>
        )}
        {privacyConsents.map((consent: IConsent) => (
          <ConsentOption
            consent={consent}
            checked={formik.values[consent.agreementName] ?? false}
            onChangeAgreement={onChangeAgreement}
            key={consent.agreementName}
          />
        ))}
        {!!notificationConsents.length && (
          <>
            <RiSpacer size="m" />
            <RiTitle size="M" className={styles.title}>
              Notifications
            </RiTitle>
            <RiSpacer size="m" />
          </>
        )}
        {notificationConsents.map((consent: IConsent) => (
          <ConsentOption
            consent={consent}
            checked={formik.values[consent.agreementName] ?? false}
            onChangeAgreement={onChangeAgreement}
            key={consent.agreementName}
          />
        ))}
      </div>
      {requiredConsents.length ? (
        <>
          <RiHorizontalRule margin="l" className={styles.requiredHR} />
          <RiSpacer size="m" />
          <RiText color="subdued" size="s" className={styles.smallText}>
            Use of Redis Insight is governed by your signed agreement with
            Redis, or, if none, by the{' '}
            <RiLink
              target="_blank"
              href="https://redis.io/software-subscription-agreement/?utm_source=redisinsight&utm_medium=app&utm_campaign=EULA"
            >
              Redis Enterprise Software Subscription Agreement
            </RiLink>
            . If no agreement applies, use is subject to the{' '}
            <RiLink
              target="_blank"
              href="https://github.com/RedisInsight/RedisInsight/blob/main/LICENSE"
            >
              Server Side Public License
            </RiLink>
          </RiText>
          <RiSpacer size="m" />
        </>
      ) : (
        <RiSpacer />
      )}

      <RiRow align="center" justify="between" responsive={false}>
        <RiFlexItem>
          {requiredConsents.map((consent: IConsent) => (
            <ConsentOption
              consent={consent}
              checked={formik.values[consent.agreementName] ?? false}
              onChangeAgreement={onChangeAgreement}
              withoutSpacer
              key={consent.agreementName}
            />
          ))}
        </RiFlexItem>
        <RiFlexItem>
          <RiTooltip
            position="top"
            anchorClassName="euiToolTip__btn-disabled"
            content={
              submitIsDisabled() ? (
                <span>
                  {Object.values(errors).map((err) => [
                    spec?.agreements[err as string]?.requiredText,
                    <br key={err} />,
                  ])}
                </span>
              ) : null
            }
          >
            <RiPrimaryButton
              className="btn-add"
              type="submit"
              onClick={() => {}}
              disabled={submitIsDisabled()}
              icon={submitIsDisabled() ? InfoIcon : undefined}
              data-testid="btn-submit"
            >
              Submit
            </RiPrimaryButton>
          </RiTooltip>
        </RiFlexItem>
      </RiRow>
    </form>
  )
}

export default ConsentsSettings
