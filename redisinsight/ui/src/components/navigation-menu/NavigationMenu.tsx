/* eslint-disable react/no-this-in-sfc */
import React from 'react'

import { FeatureFlags } from 'uiSrc/constants'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import { renderOnboardingTourWithChild } from 'uiSrc/utils/onboarding'
import { FeatureFlagComponent } from 'uiSrc/components'

import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import {
  SideBar,
  SideBarContainer,
  SideBarDivider,
  SideBarFooter,
  SideBarItem,
  SideBarItemIcon,
} from 'uiSrc/components/base/layout/sidebar'
import { GithubIcon } from 'uiSrc/components/base/icons'
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
    privateRoutes,
    privateRdiRoutes,
    isRdiWorkspace,
    publicRoutes,
    getAdditionPropsForHighlighting,
    highlightedPages,
    connectedInstanceId,
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
              <SideBarItem
                isActive={nav.isActivePage}
                onClick={nav.onClick}
                tooltipProps={{ text: nav.tooltipText, placement: 'right' }}
              >
                <SideBarItemIcon
                  icon={nav.iconType}
                  aria-label={nav.ariaLabel}
                  data-testid={nav.dataTestId}
                />
              </SideBarItem>
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
        <SideBarItem
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
        </SideBarItem>
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
    <SideBar
      isExpanded={false}
      aria-label="Main navigation"
      data-testid="main-navigation-sidebar"
      className={styles.mainNavbar}
    >
      <SideBarContainer>
        <RedisLogo isRdiWorkspace={isRdiWorkspace} />
        {connectedInstanceId &&
          !isRdiWorkspace &&
          privateRoutes.map(renderNavItem)}
        {connectedRdiInstanceId &&
          isRdiWorkspace &&
          privateRdiRoutes.map(renderNavItem)}
      </SideBarContainer>
      <SideBarFooter className={styles.footer}>
        <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
          <CreateCloud />
          <NotificationMenu />
        </FeatureFlagComponent>
        <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
          <HelpMenu />
        </FeatureFlagComponent>

        {publicRoutes.map(renderPublicNavItem)}

        <FeatureFlagComponent name={FeatureFlags.envDependent} enabledByDefault>
          <SideBarDivider data-testid="github-repo-divider-default" />
          <SideBarFooter.Link
            data-testid="github-repo-btn"
            href={EXTERNAL_LINKS.githubRepo}
            target="_blank"
          >
            <SideBarItem
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
            </SideBarItem>
          </SideBarFooter.Link>
        </FeatureFlagComponent>
      </SideBarFooter>
    </SideBar>
  )
}

export default NavigationMenu
