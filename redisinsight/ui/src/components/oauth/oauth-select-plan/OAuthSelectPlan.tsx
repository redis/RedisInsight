import React, { useCallback, useEffect, useState } from 'react'
import { toNumber, filter, get, find, first } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'

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
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { ColorText, Text, Title } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { Modal } from 'uiSrc/components/base/display'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { CloudSubscriptionPlanResponse } from 'apiSrc/modules/cloud/subscription/dto'
import { OAuthProvider, OAuthProviders } from './constants'
import {
  StyledFooter,
  StyledModalContentBody,
  StyledProvidersSection,
  StyledProvidersSelectionGroup,
  StyledRegion,
  StyledRegionName,
  StyledRegionSelectDescription,
  StyledSubTitle,
} from './OAuthSelectPlan.styles'
import { BoxSelectionGroupBox, CountryFlag } from '@redis-ui/components'

export const DEFAULT_REGIONS = ['us-east-2', 'asia-northeast1']
export const DEFAULT_PROVIDER = OAuthProvider.AWS

const getProviderRegions = (regions: Region[], provider: OAuthProvider) =>
  (find(regions, { provider }) || {}).regions || []

const oAuthProvidersBoxes: BoxSelectionGroupBox<OAuthProvider>[] =
  OAuthProviders.map(({ id, label, icon }) => ({
    value: id,
    label,
    icon: () => <RiIcon type={icon} size="XL" />,
  }))

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
  const [providerSelected, setProviderSelected] = useState<
    OAuthProvider | string
  >(DEFAULT_PROVIDER)
  const [rsProviderRegions, setRsProviderRegions] = useState(
    getProviderRegions(rsRegions, providerSelected as OAuthProvider),
  )

  const dispatch = useDispatch()

  useEffect(() => {
    setRsProviderRegions(
      getProviderRegions(rsRegions, providerSelected as OAuthProvider),
    )
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
      details: { countryName = '', cityName = '', flag = '' },
      provider,
    } = item
    const rsProviderRegions: string[] =
      find(rsRegions, { provider })?.regions || []

    return (
      <Row align="center" gap="s">
        <CountryFlag countryCode={flag} />

        <Text
          color="primary"
          data-testid={`option-${region}`}
          data-test-subj={`oauth-region-${region}`}
        >
          {`${countryName} (${cityName})`}
        </Text>

        <Text color="secondary">
          <StyledRegionName>{region}</StyledRegionName>
          {rsProviderRegions?.includes(region) && (
            <ColorText data-testid={`rs-text-${region}`}>(Redis 7.2)</ColorText>
          )}
        </Text>
      </Row>
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
    <Modal.Compose open>
      <Modal.Content.Compose data-testid="oauth-select-plan-dialog">
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={handleOnClose}
          data-testid="oauth-select-plan-dialog-close-btn"
        />
        <Modal.Content.Header.Title>
          <Row justify="center">
            <Title>Choose a cloud vendor</Title>
          </Row>
        </Modal.Content.Header.Title>
        <Modal.Content.Body.Compose width="fit-content">
          <StyledModalContentBody>
            <StyledSubTitle color="default">
              Select a cloud vendor and region to complete the final step
              towards your free Redis Cloud database. No credit card is
              required.
            </StyledSubTitle>

            <StyledProvidersSection gap="m" direction="column" align="start">
              <Text color="primary">Select cloud vendor</Text>
              <StyledProvidersSelectionGroup
                boxes={oAuthProvidersBoxes}
                value={providerSelected}
                onChange={setProviderSelected}
              />
            </StyledProvidersSection>

            <StyledRegion>
              <Text color="secondary">Region</Text>
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
                <StyledRegionSelectDescription data-testid="select-region-select-description">
                  No regions available, try another vendor.
                </StyledRegionSelectDescription>
              )}
            </StyledRegion>
            <StyledFooter>
              <Row justify="end" gap="m">
                <SecondaryButton
                  onClick={handleOnClose}
                  data-testid="close-oauth-select-plan-dialog"
                  aria-labelledby="close oauth select plan dialog"
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  disabled={loading || !planIdSelected}
                  loading={loading}
                  onClick={handleSubmit}
                  data-testid="submit-oauth-select-plan-dialog"
                  aria-labelledby="submit oauth select plan dialog"
                >
                  Create database
                </PrimaryButton>
              </Row>
            </StyledFooter>
          </StyledModalContentBody>
        </Modal.Content.Body.Compose>
      </Modal.Content.Compose>
    </Modal.Compose>
  )
}

export default OAuthSelectPlan
