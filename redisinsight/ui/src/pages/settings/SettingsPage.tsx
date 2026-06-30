import React, { useEffect, useState } from 'react'
import cx from 'classnames'

import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

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
  Page,
  PageBody,
  PageContentBody,
  PageHeader,
} from 'uiSrc/components/base/layout/page'
import { CallOut } from 'uiSrc/components/base/display/call-out/CallOut'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Loader, RICollapsibleNavGroup } from 'uiSrc/components/base/display'
import { Col } from 'uiSrc/components/base/layout/flex'
import { useTranslation } from 'uiSrc/i18n'
import {
  AdvancedSettings,
  AppVersion,
  CloudSettings,
  CopyDiagnostics,
  ThemeSettings,
  WorkbenchSettings,
} from './components'
import { DateTimeFormatter } from './components/general-settings'
import styles from './styles.module.scss'

const SettingsPage = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const { loading: settingsLoading } = useAppSelector(userSettingsSelector)

  const initialOpenSection = globalThis.location.hash || ''

  const dispatch = useAppDispatch()

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
        <div className={styles.cover}>
          <Loader size="xl" />
        </div>
      )}
      <ConsentsPrivacy />
    </div>
  )

  const WorkbenchSettingsGroup = () => (
    <div>
      {loading && (
        <div className={styles.cover}>
          <Loader size="xl" />
        </div>
      )}
      <WorkbenchSettings />
    </div>
  )

  const CloudSettingsGroup = () => (
    <div>
      {loading && (
        <div className={styles.cover}>
          <Loader size="xl" />
        </div>
      )}
      <CloudSettings />
    </div>
  )

  const AdvancedSettingsGroup = () => (
    <div>
      {loading && (
        <div className={styles.cover}>
          <Loader size="xl" />
        </div>
      )}
      <CallOut className={styles.warning}>
        <Text size="s" className={styles.smallText}>
          {t('settings.advancedWarning')}
        </Text>
      </CallOut>
      <AdvancedSettings />
    </div>
  )

  return (
    <Page className={styles.container}>
      <PageBody component="div">
        <PageHeader>
          <Title size="XXL" className={styles.title}>
            {t('settings.title')}
          </Title>
        </PageHeader>

        <PageContentBody style={{ maxWidth: 792 }}>
          <Col gap="s">
            <RICollapsibleNavGroup
              isCollapsible
              className={styles.accordion}
              title={t('settings.section.general')}
              initialIsOpen={initialOpenSection === '#general'}
              data-test-subj="accordion-appearance"
            >
              {Appearance()}
            </RICollapsibleNavGroup>{' '}
            <RICollapsibleNavGroup
              isCollapsible
              className={styles.accordion}
              title={t('settings.section.privacy')}
              initialIsOpen={initialOpenSection === '#privacy'}
              data-test-subj="accordion-privacy-settings"
            >
              {PrivacySettings()}
            </RICollapsibleNavGroup>
            <RICollapsibleNavGroup
              isCollapsible
              className={styles.accordion}
              title={t('settings.section.workbench')}
              initialIsOpen={initialOpenSection === '#workbench'}
              data-test-subj="accordion-workbench-settings"
              data-testid="accordion-workbench-settings"
              id="accordion-workbench-settings"
            >
              {WorkbenchSettingsGroup()}
            </RICollapsibleNavGroup>
            <FeatureFlagComponent name={FeatureFlags.cloudSso}>
              <RICollapsibleNavGroup
                isCollapsible
                className={cx(styles.accordion, styles.accordionWithSubTitle)}
                title={t('settings.section.cloud')}
                initialIsOpen={initialOpenSection === '#cloud'}
                data-test-subj="accordion-cloud-settings"
              >
                {CloudSettingsGroup()}
              </RICollapsibleNavGroup>
            </FeatureFlagComponent>
            <RICollapsibleNavGroup
              isCollapsible
              className={cx(styles.accordion, styles.accordionWithSubTitle)}
              title={t('settings.section.advanced')}
              initialIsOpen={initialOpenSection === '#advanced'}
              data-test-subj="accordion-advanced-settings"
            >
              {AdvancedSettingsGroup()}
            </RICollapsibleNavGroup>
          </Col>
          <AppVersion />
          <CopyDiagnostics />
        </PageContentBody>
      </PageBody>
    </Page>
  )
}

export default SettingsPage
