import React, { useCallback, useEffect, useState } from 'react'
import { toNumber, filter, get, find, first } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'

import {
  createFreeDbJob,
  oauthCloudPlanSelector,
  setIsOpenSelectPlanDialog,
  setSocialDialogState,
} from 'uiSrc/slices/oauth/cloud'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import { addInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { FeatureFlags } from 'uiSrc/constants'
import { Region } from 'uiSrc/slices/interfaces'

import {
  EmptyButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { RiModal } from 'uiSrc/components/base/display'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { CloudSubscriptionPlanResponse } from 'apiSrc/modules/cloud/subscription/dto'
import { OAuthProvider, OAuthProviders } from './constants'
import styles from './styles.module.scss'

export const DEFAULT_REGIONS = ['us-east-2', 'asia-northeast1']
export const DEFAULT_PROVIDER = OAuthProvider.AWS

const getProviderRegions = (regions: Region[], provider: OAuthProvider) =>
  (find(regions, { provider }) || {}).regions || []

const OAuthSelectPlan = () => {
  const {
    isOpenDialog,
    data: plansInit = [],
    loading,
  } = useSelector(oauthCloudPlanSelector)
  const { [FeatureFlags.cloudSso]: cloudSsoFeature = {} } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const rsRegions: Region[] = get(
    cloudSsoFeature,
    'data.selectPlan.components.redisStackPreview',
    [],
  )

  const [plans, setPlans] = useState(plansInit || [])
  const [planIdSelected, setPlanIdSelected] = useState('')
  const [providerSelected, setProviderSelected] =
    useState<OAuthProvider>(DEFAULT_PROVIDER)
  const [rsProviderRegions, setRsProviderRegions] = useState(
    getProviderRegions(rsRegions, providerSelected),
  )

  const dispatch = useDispatch()

  useEffect(() => {
    setRsProviderRegions(getProviderRegions(rsRegions, providerSelected))
  }, [providerSelected, plansInit])

  useEffect(() => {
    if (!plansInit.length) {
      return
    }

    const filteredPlans = filter(plansInit, {
      provider: providerSelected,
    }).sort(
      (a, b) =>
        (a?.details?.displayOrder || 0) - (b?.details?.displayOrder || 0),
    )

    const defaultPlan = filteredPlans.find(({ region = '' }) =>
      DEFAULT_REGIONS.includes(region),
    )
    const rsPreviewPlan = filteredPlans.find(({ region = '' }) =>
      rsProviderRegions?.includes(region),
    )
    const planId =
      (
        defaultPlan ||
        rsPreviewPlan ||
        first(filteredPlans) ||
        {}
      ).id?.toString() || ''

    setPlans(filteredPlans)
    setPlanIdSelected(planId)
  }, [plansInit, providerSelected, rsProviderRegions])

  const handleOnClose = useCallback(() => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_SIGN_IN_PROVIDER_FORM_CLOSED,
    })
    setPlanIdSelected('')
    setProviderSelected(DEFAULT_PROVIDER)
    dispatch(setIsOpenSelectPlanDialog(false))
    dispatch(setSocialDialogState(null))
  }, [])

  if (!isOpenDialog) return null

  const getOptionDisplay = (item: CloudSubscriptionPlanResponse) => {
    const {
      region = '',
      details: { countryName = '', cityName = '' },
      provider,
    } = item
    const rsProviderRegions: string[] =
      find(rsRegions, { provider })?.regions || []

    return (
      <Text
        color="subdued"
        size="s"
        data-testid={`option-${region}`}
        data-test-subj={`oauth-region-${region}`}
      >
        {`${countryName} (${cityName})`}
        <ColorText className={styles.regionName}>{region}</ColorText>
        {rsProviderRegions?.includes(region) && (
          <ColorText
            className={styles.rspreview}
            data-testid={`rs-text-${region}`}
          >
            (Redis 7.2)
          </ColorText>
        )}
      </Text>
    )
  }

  const regionOptions = plans.map((item) => {
    const { id, region = '' } = item
    return {
      label: `${id}`,
      value: `${id}`,
      inputDisplay: getOptionDisplay(item),
      dropdownDisplay: getOptionDisplay(item),
      'data-test-subj': `oauth-region-${region}`,
    }
  })

  const onChangeRegion = (region: string) => {
    setPlanIdSelected(region)
  }

  const handleSubmit = () => {
    dispatch(
      createFreeDbJob({
        name: CloudJobName.CreateFreeSubscriptionAndDatabase,
        resources: { planId: toNumber(planIdSelected) },
        onSuccessAction: () => {
          dispatch(setIsOpenSelectPlanDialog(false))
          dispatch(
            addInfiniteNotification(
              INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
            ),
          )
        },
      }),
    )
  }

  return (
    <RiModal.Compose open>
      <RiModal.Content.Compose
        className={styles.container}
        data-testid="oauth-select-plan-dialog"
      >
        <RiModal.Content.Close
          icon={CancelIcon}
          onClick={handleOnClose}
          data-testid="oauth-select-plan-dialog-close-btn"
        />
        <RiModal.Content.Header.Title>
          Choose a cloud vendor
        </RiModal.Content.Header.Title>
        <RiModal.Content.Body.Compose width="fit-content">
          <section className={styles.content}>
            <Text className={styles.subTitle}>
              Select a cloud vendor and region to complete the final step
              towards your free trial Redis database. No credit card is
              required.
            </Text>
            <section className={styles.providers}>
              {OAuthProviders.map(({ icon, id, label }) => {
                const Icon = () => (
                  <RiIcon type={icon} size="original" style={{ width: 44 }} />
                )
                return (
                  <div className={styles.provider} key={id}>
                    {id === providerSelected && (
                      <div className={cx(styles.providerActiveIcon)}>
                        <RiIcon type="CheckThinIcon" />
                      </div>
                    )}
                    <EmptyButton
                      size="large"
                      icon={Icon}
                      onClick={() => setProviderSelected(id)}
                      className={cx(styles.providerBtn, {
                        [styles.activeProvider]: id === providerSelected,
                      })}
                    />
                    <Text className={styles.providerLabel}>{label}</Text>
                  </div>
                )
              })}
            </section>
            <section className={styles.region}>
              <Text className={styles.regionLabel}>Region</Text>
              <RiSelect
                loading={loading}
                disabled={loading || !regionOptions.length}
                options={regionOptions}
                value={planIdSelected}
                data-testid="select-oauth-region"
                onChange={onChangeRegion}
                valueRender={({ option, isOptionValue }) => {
                  if (isOptionValue) {
                    return option.inputDisplay
                  }
                  return option.dropdownDisplay
                }}
              />
              {!regionOptions.length && (
                <Text
                  className={styles.selectDescription}
                  data-testid="select-region-select-description"
                >
                  No regions available, try another vendor.
                </Text>
              )}
            </section>
            <footer className={styles.footer}>
              <SecondaryButton
                className={styles.button}
                onClick={handleOnClose}
                data-testid="close-oauth-select-plan-dialog"
                aria-labelledby="close oauth select plan dialog"
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                disabled={loading || !planIdSelected}
                loading={loading}
                className={styles.button}
                onClick={handleSubmit}
                data-testid="submit-oauth-select-plan-dialog"
                aria-labelledby="submit oauth select plan dialog"
              >
                Create database
              </PrimaryButton>
            </footer>
          </section>
        </RiModal.Content.Body.Compose>
      </RiModal.Content.Compose>
    </RiModal.Compose>
  )
}

export default OAuthSelectPlan
