/* eslint-disable react/no-this-in-sfc */
import React from 'react'

import { RiBadge } from 'uiBase/display'
import {
  RiSideBar,
  RiSideBarContainer,
  RiSideBarDivider,
  RiSideBarFooter,
  RiSideBarItem,
  SideBarItemIcon,
} from 'uiBase/layout'
import { GithubIcon } from 'uiBase/icons'
import { FeatureFlags } from 'uiSrc/constants'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import { renderOnboardingTourWithChild } from 'uiSrc/utils/onboarding'
import { FeatureFlagComponent } from 'uiSrc/components'

import { INavigations } from './navigation.types'
import CreateCloud from './components/create-cloud'
import HelpMenu from './components/help-menu/HelpMenu'
import NotificationMenu from './components/notifications-center'

import { RedisLogo } from './components/redis-logo/RedisLogo'
import { useNavigation } from './hooks/useNavigation'
import HighlightedFeature from '../hightlighted-feature/HighlightedFeature'
import styles from './styles.module.scss'

const NavigationMenu = () => {
  const {
    privateRdiRoutes,
    isRdiWorkspace,
    publicRoutes,
    getAdditionPropsForHighlighting,
    highlightedPages,
    connectedRdiInstanceId,
  } = useNavigation()

  const renderNavItem = (nav: INavigations) => {
    const fragment = (
      <React.Fragment key={nav.tooltipText}>
        {renderOnboardingTourWithChild(
          <HighlightedFeature
            {...getAdditionPropsForHighlighting(nav.pageName)}
            key={nav.tooltipText}
            isHighlight={!!highlightedPages[nav.pageName]?.length}
            dotClassName={styles.highlightDot}
            tooltipPosition="right"
            transformOnHover
          >
            <div className={styles.navigationButtonWrapper}>
              <RiSideBarItem
                isActive={nav.isActivePage}
                onClick={nav.onClick}
                tooltipProps={{ text: nav.tooltipText, placement: 'right' }}
              >
                <SideBarItemIcon
                  icon={nav.iconType}
                  aria-label={nav.ariaLabel}
                  data-testid={nav.dataTestId}
                />
              </RiSideBarItem>
              {nav.isBeta && (
                <RiBadge className={styles.betaLabel} label="BETA" />
              )}
            </div>
          </HighlightedFeature>,
          { options: nav.onboard },
          nav.isActivePage,
          `ob-${nav.tooltipText}`,
        )}
      </React.Fragment>
    )

    return nav.featureFlag ? (
      <FeatureFlagComponent
        name={nav.featureFlag}
        key={nav.tooltipText}
        enabledByDefault
      >
        {fragment}
      </FeatureFlagComponent>
    ) : (
      fragment
    )
  }

  const renderPublicNavItem = (nav: INavigations) => {
    const fragment = (
      <HighlightedFeature
        key={nav.tooltipText}
        isHighlight={!!highlightedPages[nav.pageName]?.length}
        dotClassName={styles.highlightDot}
        transformOnHover
      >
        <RiSideBarItem
          tooltipProps={{ text: nav.tooltipText, placement: 'right' }}
          onClick={nav.onClick}
          isActive={nav.isActivePage}
          className={styles.sideBarItem}
        >
          <SideBarItemIcon
            icon={nav.iconType}
            aria-label={nav.ariaLabel}
            data-testid={nav.dataTestId}
          />
        </RiSideBarItem>
      </HighlightedFeature>
    )

    return nav.featureFlag ? (
      <FeatureFlagComponent
        name={nav.featureFlag}
        key={nav.tooltipText}
        enabledByDefault
      >
        {fragment}
      </FeatureFlagComponent>
    ) : (
      fragment
    )
  }

  return (
    <RiSideBar
      isExpanded={false}
      aria-label="Main navigation"
      data-testid="main-navigation-sidebar"
      className={styles.mainNavbar}
    >
      <RiSideBarContainer>
        <RedisLogo isRdiWorkspace={isRdiWorkspace} />
        {connectedRdiInstanceId &&
          isRdiWorkspace &&
          privateRdiRoutes.map(renderNavItem)}
      </RiSideBarContainer>
      <RiSideBarFooter className={styles.footer}>
        <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
          <CreateCloud />
          <NotificationMenu />
        </FeatureFlagComponent>
        <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
          <HelpMenu />
        </FeatureFlagComponent>

        {publicRoutes.map(renderPublicNavItem)}

        <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
          <RiSideBarDivider data-testid="github-repo-divider-default" />
          <RiSideBarFooter.Link
            data-testid="github-repo-btn"
            href={EXTERNAL_LINKS.githubRepo}
            target="_blank"
          >
            <RiSideBarItem
              className={styles.githubNavItem}
              tooltipProps={{
                text: 'Star us on GitHub',
                placement: 'right',
              }}
            >
              <SideBarItemIcon
                icon={GithubIcon}
                aria-label="github-repo-icon"
                data-testid="github-repo-icon"
              />
            </RiSideBarItem>
          </RiSideBarFooter.Link>
        </FeatureFlagComponent>
      </RiSideBarFooter>
    </RiSideBar>
  )
}

export default NavigationMenu
