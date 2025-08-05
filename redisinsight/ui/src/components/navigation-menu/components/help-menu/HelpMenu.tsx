import cx from 'classnames'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { ReleaseNotesSource } from 'uiSrc/constants/telemetry'
import {
  appElectronInfoSelector,
  setReleaseNotesViewed,
  setShortcutsFlyoutState,
} from 'uiSrc/slices/app/info'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { setOnboarding } from 'uiSrc/slices/app/features'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { FeatureFlags } from 'uiSrc/constants'
import { FeatureFlagComponent } from 'uiSrc/components'
import { RiPopover } from 'uiSrc/components/base'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Title } from 'uiSrc/components/base/text/Title'
import { SupportIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import {
  SideBarItem,
  SideBarItemIcon,
} from 'uiSrc/components/base/layout/sidebar'
import { RiIcon } from 'uiSrc/components/base/icons'
import navStyles from '../../styles.module.scss'
import styles from './styles.module.scss'

const HelpMenu = () => {
  const { id: connectedInstanceId = '' } = useSelector(
    connectedInstanceSelector,
  )
  const { isReleaseNotesViewed } = useSelector(appElectronInfoSelector)
  const [isHelpMenuActive, setIsHelpMenuActive] = useState(false)

  const dispatch = useDispatch()

  const onKeyboardShortcutClick = () => {
    setIsHelpMenuActive(false)
    dispatch(setShortcutsFlyoutState(true))
  }

  const onClickReleaseNotes = async () => {
    sendEventTelemetry({
      event: TelemetryEvent.RELEASE_NOTES_LINK_CLICKED,
      eventData: {
        source: ReleaseNotesSource.helpCenter,
      },
    })
    if (isReleaseNotesViewed === false) {
      dispatch(setReleaseNotesViewed(true))
    }
  }

  const onResetOnboardingClick = () => {
    const totalSteps = Object.keys(ONBOARDING_FEATURES || {}).length

    dispatch(setOnboarding({ currentStep: 0, totalSteps }))
    sendEventTelemetry({
      event: TelemetryEvent.ONBOARDING_TOUR_TRIGGERED,
      eventData: {
        databaseId: connectedInstanceId || '-',
      },
    })
  }

  const HelpMenuButton = (
    <SideBarItem
      className={cx({
        [navStyles.navigationButtonNotified]: true,
      })}
      onClick={() => setIsHelpMenuActive((value) => !value)}
      tooltipProps={{ text: 'Help', placement: 'right' }}
      isActive={isHelpMenuActive}
    >
      <SideBarItemIcon
        icon={SupportIcon}
        aria-label="Help Menu"
        data-testid="help-menu-button"
      />
    </SideBarItem>
  )

  return (
    <RiPopover
      anchorPosition="rightUp"
      isOpen={isHelpMenuActive}
      anchorClassName={styles.unsupportedInfo}
      panelClassName={cx('popoverLikeTooltip', styles.popoverWrapper)}
      closePopover={() => setIsHelpMenuActive(false)}
      button={HelpMenuButton}
    >
      <div className={styles.popover} data-testid="help-center">
        <Title size="XS" className={styles.helpMenuTitle}>
          Help Center
        </Title>
        <Spacer size="l" />
        <Row
          className={styles.helpMenuItems}
          align="center"
          justify="between"
          gap="l"
        >
          <FeatureFlagComponent name={FeatureFlags.envDependent}>
            <FlexItem grow={2} className={styles.helpMenuItem}>
              <Link
                className={styles.helpMenuItemLink}
                href={EXTERNAL_LINKS.githubIssues}
                target="_blank"
                data-testid="submit-bug-btn"
              >
                <RiIcon type="GithubHelpCenterIcon" size="xxl" />
                <Spacer size="m" />
                <Text
                  size="xs"
                  textAlign="center"
                  className={styles.helpMenuText}
                >
                  Provide <br /> Feedback
                </Text>
              </Link>
            </FlexItem>
          </FeatureFlagComponent>
          <FlexItem className={styles.helpMenuItemRow} grow={4}>
            <div className={styles.helpMenuItemLink}>
              <RiIcon type="KeyboardShortcutsIcon" size="l" />
              <Text
                size="xs"
                className={styles.helpMenuTextLink}
                onClick={() => onKeyboardShortcutClick()}
                data-testid="shortcuts-btn"
              >
                Keyboard Shortcuts
              </Text>
            </div>

            <div className={styles.helpMenuItemLink}>
              <div
                className={cx({
                  [styles.helpMenuItemNotified]: isReleaseNotesViewed === false,
                })}
                style={{ display: 'flex' }}
              >
                <RiIcon type="DocumentationIcon" size="l" />
              </div>
              <Link
                onClick={onClickReleaseNotes}
                className={styles.helpMenuTextLink}
                href={EXTERNAL_LINKS.releaseNotes}
                target="_blank"
                data-testid="release-notes-btn"
              >
                <Text size="xs" className={styles.helpMenuTextLink}>
                  Release Notes
                </Text>
              </Link>
            </div>
            <FeatureFlagComponent name={FeatureFlags.envDependent}>
              <div className={styles.helpMenuItemLink}>
                <RiIcon type="LightBulbIcon" size="l" />
                <Text
                  size="xs"
                  className={styles.helpMenuTextLink}
                  onClick={() => onResetOnboardingClick()}
                  data-testid="reset-onboarding-btn"
                >
                  Reset Onboarding
                </Text>
              </div>
            </FeatureFlagComponent>
          </FlexItem>
        </Row>
      </div>
    </RiPopover>
  )
}

export default HelpMenu
