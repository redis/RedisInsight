import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import { useHistory } from 'react-router-dom'

import {
  activateAccount,
  createFreeDbJob,
  fetchPlans,
  oauthCloudPlanSelector,
  oauthCloudSelector,
  oauthCloudUserDataSelector,
  oauthCloudUserSelector,
  setSelectAccountDialogState,
} from 'uiSrc/slices/oauth/cloud'
import { Nullable } from 'uiSrc/utils'
import {
  cloudSelector,
  fetchSubscriptionsRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import {
  addInfiniteNotification,
  removeInfiniteNotification,
} from 'uiSrc/slices/app/notifications'
import {
  INFINITE_MESSAGES,
  InfiniteMessagesIds,
} from 'uiSrc/components/notifications/components'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import { OAuthSocialAction } from 'uiSrc/slices/interfaces'

import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { ColorText, Text } from 'uiSrc/components/base/text'
import {
  RiRadioGroupItemIndicator,
  RiRadioGroupItemLabel,
  RiRadioGroupItemRoot,
  RiRadioGroupRoot,
} from 'uiSrc/components/base/forms/radio-group/RadioGroup'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Modal } from 'uiSrc/components/base/display'
import styles from './styles.module.scss'

interface FormValues {
  accountId: Nullable<string>
}

const OAuthSelectAccountDialog = () => {
  const { ssoFlow, isRecommendedSettings } = useSelector(cloudSelector)
  const { accounts = [], currentAccountId } =
    useSelector(oauthCloudUserDataSelector) ?? {}
  const { isOpenSelectAccountDialog } = useSelector(oauthCloudSelector)
  const { loading } = useSelector(oauthCloudUserSelector)
  const { loading: plansLoadings } = useSelector(oauthCloudPlanSelector)

  const isAutodiscoverySSO = ssoFlow === OAuthSocialAction.Import

  const history = useHistory()
  const dispatch = useDispatch()

  const initialValues = {
    accountId: `${currentAccountId}`,
  }

  const formik = useFormik({
    initialValues,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values)
    },
  })

  const onSubmit = ({ accountId }: FormValues) => {
    dispatch(
      activateAccount(
        accountId || '',
        onActivateAccountSuccess,
        onActivateAccountFail,
      ),
    )
  }

  const onActivateAccountSuccess = useCallback(() => {
    if (isAutodiscoverySSO) {
      dispatch(
        fetchSubscriptionsRedisCloud(
          null,
          true,
          () => {
            dispatch(
              removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
            )
            history.push(Pages.redisCloudSubscriptions)
          },
          () => {
            dispatch(
              removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
            )
          },
        ),
      )
      dispatch(setSelectAccountDialogState(false))
    } else if (isRecommendedSettings) {
      dispatch(
        createFreeDbJob({
          name: CloudJobName.CreateFreeSubscriptionAndDatabase,
          resources: {
            isRecommendedSettings,
          },
          onSuccessAction: () => {
            dispatch(setSelectAccountDialogState(false))
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
              ),
            )
          },
          onFailAction: () => {
            dispatch(
              removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
            )
          },
        }),
      )
    } else {
      dispatch(fetchPlans())
    }

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_ACCOUNT_SELECTED,
      eventData: {
        action: ssoFlow,
        accountsCount: accounts.length,
      },
    })
  }, [isAutodiscoverySSO, isRecommendedSettings, accounts])

  const onActivateAccountFail = useCallback(
    (error: string) => {
      sendEventTelemetry({
        event: TelemetryEvent.CLOUD_SIGN_IN_ACCOUNT_FAILED,
        eventData: {
          error,
          accountsCount: accounts.length,
        },
      })
    },
    [accounts],
  )

  const handleOnClose = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_ACCOUNT_FORM_CLOSED,
      eventData: { accountsCount: accounts.length },
    })

    dispatch(setSelectAccountDialogState(false))
  }, [accounts])

  if (accounts.length < 2 || !isOpenSelectAccountDialog) return null

  const handleChangeAccountIdFormat = (value: string) => {
    formik.setFieldValue('accountId', value)
  }

  const radios = accounts.map(({ id, name = '' }) => ({
    id: `${id}`,
    label: (
      <ColorText color="subdued">
        {name}
        <ColorText color="accent" style={{ paddingLeft: 6 }}>
          {id}
        </ColorText>
      </ColorText>
    ),
  }))

  return (
    <Modal
      open
      className={styles.container}
      onCancel={handleOnClose}
      data-testid="oauth-select-account-dialog"
      title="Connect to Redis Cloud"
      content={
        <>
          <section className={styles.content}>
            <Text className={styles.subTitle}>
              Select an account to connect to:
            </Text>
            <Spacer size="xl" />
            <RiRadioGroupRoot
              value={formik.values.accountId ?? ''}
              onChange={(id) => handleChangeAccountIdFormat(id)}
            >
              {radios.map(({ id, label }) => (
                <RiRadioGroupItemRoot value={id} key={id}>
                  <RiRadioGroupItemIndicator />
                  <RiRadioGroupItemLabel>{label}</RiRadioGroupItemLabel>
                </RiRadioGroupItemRoot>
              ))}
            </RiRadioGroupRoot>
          </section>
          <div className={styles.footer}>
            <SecondaryButton
              className={styles.button}
              onClick={handleOnClose}
              data-testid="close-oauth-select-account-dialog"
              aria-labelledby="close oauth select account dialog"
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              disabled={loading || plansLoadings}
              loading={loading || plansLoadings}
              className={styles.button}
              onClick={() => formik.handleSubmit()}
              data-testid="submit-oauth-select-account-dialog"
              aria-labelledby="submit oauth select account dialog"
            >
              Select account
            </PrimaryButton>
          </div>
        </>
      }
    />
  )
}

export default OAuthSelectAccountDialog
