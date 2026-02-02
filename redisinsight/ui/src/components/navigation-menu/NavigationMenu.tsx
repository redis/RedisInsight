/* eslint-disable react/no-this-in-sfc */
import React from 'react'

import { FeatureFlags } from 'uiSrc/constants'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import { FeatureFlagComponent } from 'uiSrc/components'

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
import * as S from './NavigationMenu.styles'

const NavigationMenu = () => {
  const { isRdiWorkspace, publicRoutes, highlightedPages } = useNavigation()

  const renderPublicNavItem = (nav: INavigations) => {
    const fragment = (
      <HighlightedFeature
        key={nav.tooltipText}
        isHighlight={!!highlightedPages[nav.pageName]?.length}
        transformOnHover
      >
        <SideBarItem
          tooltipProps={{ text: nav.tooltipText, placement: 'right' }}
          onClick={nav.onClick}
          isActive={nav.isActivePage}
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
    <S.MainNavbar
      as={SideBar}
      isExpanded={false}
      aria-label="Main navigation"
      data-testid="main-navigation-sidebar"
    >
      <SideBarContainer>
        <RedisLogo isRdiWorkspace={isRdiWorkspace} />
      </SideBarContainer>
      <S.Footer as={SideBarFooter}>
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
      </S.Footer>
    </S.MainNavbar>
  )
}

export default NavigationMenu
