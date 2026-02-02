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
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { SupportIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import {
  SideBarItem,
  SideBarItemIcon,
} from 'uiSrc/components/base/layout/sidebar'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as S from './HelpMenu.styles'

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
      panelClassName="popoverLikeTooltip"
      minWidth={S.POPOVER_MIN_WIDTH}
      closePopover={() => setIsHelpMenuActive(false)}
      button={HelpMenuButton}
    >
      <S.Popover data-testid="help-center">
        <S.HelpMenuTitle size="XS">Help Center</S.HelpMenuTitle>
        <Spacer size="l" />
        <S.HelpMenuItems align="center" justify="between" gap="l">
          <FeatureFlagComponent name={FeatureFlags.envDependent}>
            <S.HelpMenuItem grow={2}>
              <Link
                href={EXTERNAL_LINKS.githubIssues}
                target="_blank"
                data-testid="submit-bug-btn"
              >
                <S.HelpMenuItemLink>
                  <RiIcon type="GithubIcon" size="original" />
                  <Spacer size="xs" />
                  <Text size="xs" textAlign="center">
                    <S.HelpMenuText>
                      Provide <br /> Feedback
                    </S.HelpMenuText>
                  </Text>
                </S.HelpMenuItemLink>
              </Link>
            </S.HelpMenuItem>
          </FeatureFlagComponent>

          <S.HelpMenuItemRow grow={4}>
            <S.HelpMenuItemRowLink align="center" gap="xs">
              <RiIcon type="KeyboardShortcutsIcon" size="l" />
              <S.HelpMenuTextLink
                onClick={onKeyboardShortcutClick}
                data-testid="shortcuts-btn"
              >
                Keyboard Shortcuts
              </S.HelpMenuTextLink>
            </S.HelpMenuItemRowLink>

            <S.HelpMenuItemRowLink align="center" gap="xs">
              {isReleaseNotesViewed === false ? (
                <S.HelpMenuItemNotified>
                  <RiIcon type="DocumentationIcon" size="l" />
                </S.HelpMenuItemNotified>
              ) : (
                <RiIcon type="DocumentationIcon" size="l" />
              )}
              <Link
                onClick={onClickReleaseNotes}
                href={EXTERNAL_LINKS.releaseNotes}
                target="_blank"
                data-testid="release-notes-btn"
              >
                <S.HelpMenuTextLink>Release Notes</S.HelpMenuTextLink>
              </Link>
            </S.HelpMenuItemRowLink>

            <FeatureFlagComponent name={FeatureFlags.envDependent}>
              <S.HelpMenuItemRowLink align="center" gap="xs">
                <RiIcon type="LightBulbIcon" size="l" />
                <S.HelpMenuTextLink
                  onClick={onResetOnboardingClick}
                  data-testid="reset-onboarding-btn"
                >
                  Reset Onboarding
                </S.HelpMenuTextLink>
              </S.HelpMenuItemRowLink>
            </FeatureFlagComponent>
          </S.HelpMenuItemRow>
        </S.HelpMenuItems>
      </S.Popover>
    </RiPopover>
  )
}

export default HelpMenu
