import React, { useEffect, useState } from 'react'
import cx from 'classnames'

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
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import {
  RiPage,
  RiPageBody,
  RiPageContentBody,
  RiPageHeader,
  RiCol,
} from 'uiSrc/components/base/layout'
import {
  RiCallOut,
  RiLoader,
  RiCollapsibleNavGroup,
} from 'uiSrc/components/base/display'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import {
  AdvancedSettings,
  CloudSettings,
  ThemeSettings,
  WorkbenchSettings,
} from './components'
import { DateTimeFormatter } from './components/general-settings'
import styles from './styles.module.scss'

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
      <Divider colorVariable="separatorColor" />
      <RiSpacer />
      <DateTimeFormatter />
    </>
  )

  const PrivacySettings = () => (
    <div>
      {loading && (
        <div className={styles.cover}>
          <RiLoader size="xl" />
        </div>
      )}
      <ConsentsPrivacy />
    </div>
  )

  const WorkbenchSettingsGroup = () => (
    <div>
      {loading && (
        <div className={styles.cover}>
          <RiLoader size="xl" />
        </div>
      )}
      <WorkbenchSettings />
    </div>
  )

  const CloudSettingsGroup = () => (
    <div>
      {loading && (
        <div className={styles.cover}>
          <RiLoader size="xl" />
        </div>
      )}
      <CloudSettings />
    </div>
  )

  const AdvancedSettingsGroup = () => (
    <div>
      {loading && (
        <div className={styles.cover}>
          <RiLoader size="xl" />
        </div>
      )}
      <RiCallOut className={styles.warning}>
        <Text size="s" className={styles.smallText}>
          Advanced settings should only be changed if you understand their
          impact.
        </Text>
      </RiCallOut>
      <AdvancedSettings />
    </div>
  )

  return (
    <RiPage className={styles.container}>
      <RiPageBody component="div">
        <RiPageHeader>
          <Title size="XXL" className={styles.title}>
            Settings
          </Title>
        </RiPageHeader>

        <RiPageContentBody style={{ maxWidth: 792 }}>
          <RiCol gap="s">
            <RiCollapsibleNavGroup
              isCollapsible
              className={styles.accordion}
              title="General"
              initialIsOpen={initialOpenSection === '#general'}
              data-test-subj="accordion-appearance"
            >
              {Appearance()}
            </RiCollapsibleNavGroup>{' '}
            <RiCollapsibleNavGroup
              isCollapsible
              className={styles.accordion}
              title="Privacy"
              initialIsOpen={initialOpenSection === '#privacy'}
              data-test-subj="accordion-privacy-settings"
            >
              {PrivacySettings()}
            </RiCollapsibleNavGroup>
            <RiCollapsibleNavGroup
              isCollapsible
              className={styles.accordion}
              title="Workbench"
              initialIsOpen={initialOpenSection === '#workbench'}
              data-test-subj="accordion-workbench-settings"
              data-testid="accordion-workbench-settings"
              id="accordion-workbench-settings"
            >
              {WorkbenchSettingsGroup()}
            </RiCollapsibleNavGroup>
            <FeatureFlagComponent name={FeatureFlags.cloudSso}>
              <RiCollapsibleNavGroup
                isCollapsible
                className={cx(styles.accordion, styles.accordionWithSubTitle)}
                title="Redis Cloud"
                initialIsOpen={initialOpenSection === '#cloud'}
                data-test-subj="accordion-cloud-settings"
              >
                {CloudSettingsGroup()}
              </RiCollapsibleNavGroup>
            </FeatureFlagComponent>
            <RiCollapsibleNavGroup
              isCollapsible
              className={cx(styles.accordion, styles.accordionWithSubTitle)}
              title="Advanced"
              initialIsOpen={initialOpenSection === '#advanced'}
              data-test-subj="accordion-advanced-settings"
            >
              {AdvancedSettingsGroup()}
            </RiCollapsibleNavGroup>
          </RiCol>
        </RiPageContentBody>
      </RiPageBody>
    </RiPage>
  )
}

export default SettingsPage
