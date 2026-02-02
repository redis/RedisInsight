import React, { useEffect, useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { setTitle } from 'uiSrc/utils'
import { FeatureFlags } from 'uiSrc/constants'
import { useDebouncedEffect } from 'uiSrc/services'
import {
  ConsentsNotifications,
  ConsentsPrivacy,
  FeatureFlagComponent,
} from 'uiSrc/components'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import {
  fetchUserConfigSettings,
  fetchUserSettingsSpec,
  userSettingsSelector,
} from 'uiSrc/slices/user/user-settings'

import Divider from 'uiSrc/components/divider/Divider'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  PageBody,
  PageContentBody,
  PageHeader,
} from 'uiSrc/components/base/layout/page'
import { Loader } from 'uiSrc/components/base/display'
import { Col } from 'uiSrc/components/base/layout/flex'
import {
  AdvancedSettings,
  CloudSettings,
  ThemeSettings,
  WorkbenchSettings,
} from './components'
import { DateTimeFormatter } from './components/general-settings'
import * as S from './SettingsPage.styles'

const SettingsPage = () => {
  const [loading, setLoading] = useState(false)
  const { loading: settingsLoading } = useSelector(userSettingsSelector)

  const initialOpenSection = globalThis.location.hash || ''

  const dispatch = useDispatch()

  useEffect(() => {
    // componentDidMount
    // fetch config settings, after that take spec
    dispatch(fetchUserConfigSettings(() => dispatch(fetchUserSettingsSpec())))
  }, [])

  useEffect(() => {
    sendPageViewTelemetry({
      name: TelemetryPageView.SETTINGS_PAGE,
    })
  }, [])

  useDebouncedEffect(() => setLoading(settingsLoading), 100, [settingsLoading])
  setTitle('Settings')

  const Appearance = () => (
    <>
      <ThemeSettings />
      <ConsentsNotifications />
      <Divider />
      <Spacer />
      <DateTimeFormatter />
    </>
  )

  const PrivacySettings = () => (
    <div>
      {loading && (
        <S.Cover>
          <Loader size="xl" />
        </S.Cover>
      )}
      <ConsentsPrivacy />
    </div>
  )

  const WorkbenchSettingsGroup = () => (
    <div>
      {loading && (
        <S.Cover>
          <Loader size="xl" />
        </S.Cover>
      )}
      <WorkbenchSettings />
    </div>
  )

  const CloudSettingsGroup = () => (
    <div>
      {loading && (
        <S.Cover>
          <Loader size="xl" />
        </S.Cover>
      )}
      <CloudSettings />
    </div>
  )

  const AdvancedSettingsGroup = () => (
    <div>
      {loading && (
        <S.Cover>
          <Loader size="xl" />
        </S.Cover>
      )}
      <S.Warning>
        <S.SmallText>
          Advanced settings should only be changed if you understand their
          impact.
        </S.SmallText>
      </S.Warning>
      <AdvancedSettings />
    </div>
  )

  return (
    <S.Container>
      <PageBody component="div">
        <PageHeader>
          <S.PageTitle size="XXL">Settings</S.PageTitle>
        </PageHeader>

        <PageContentBody style={{ maxWidth: 792 }}>
          <Col gap="s">
            <S.Accordion
              isCollapsible
              title="General"
              initialIsOpen={initialOpenSection === '#general'}
              data-test-subj="accordion-appearance"
            >
              {Appearance()}
            </S.Accordion>{' '}
            <S.Accordion
              isCollapsible
              title="Privacy"
              initialIsOpen={initialOpenSection === '#privacy'}
              data-test-subj="accordion-privacy-settings"
            >
              {PrivacySettings()}
            </S.Accordion>
            <S.Accordion
              isCollapsible
              title="Workbench"
              initialIsOpen={initialOpenSection === '#workbench'}
              data-test-subj="accordion-workbench-settings"
              data-testid="accordion-workbench-settings"
              id="accordion-workbench-settings"
            >
              {WorkbenchSettingsGroup()}
            </S.Accordion>
            <FeatureFlagComponent name={FeatureFlags.cloudSso}>
              <S.AccordionWithSubTitle
                isCollapsible
                title="Redis Cloud"
                initialIsOpen={initialOpenSection === '#cloud'}
                data-test-subj="accordion-cloud-settings"
              >
                {CloudSettingsGroup()}
              </S.AccordionWithSubTitle>
            </FeatureFlagComponent>
            <S.AccordionWithSubTitle
              isCollapsible
              title="Advanced"
              initialIsOpen={initialOpenSection === '#advanced'}
              data-test-subj="accordion-advanced-settings"
            >
              {AdvancedSettingsGroup()}
            </S.AccordionWithSubTitle>
          </Col>
        </PageContentBody>
      </PageBody>
    </S.Container>
  )
}

export default SettingsPage
