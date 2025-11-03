import React from 'react'

import { FeatureFlagComponent, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import CloudIcon from 'uiSrc/assets/img/oauth/cloud_centered.svg?react'

import { getUtmExternalLink } from 'uiSrc/utils/links'
import { sendEventTelemetry } from 'uiSrc/telemetry'
import { HELP_LINKS } from 'uiSrc/pages/home/constants'
import { FeatureFlags } from 'uiSrc/constants'
import { SideBarItem } from 'uiSrc/components/base/layout/sidebar'
import { SideBarItemIcon } from 'uiSrc/components/base/layout/sidebar/SideBarItemIcon'
import { Link } from 'uiSrc/components/base/link/Link'

const CreateCloud = () => {
  const onCLickLink = (isSSOEnabled: boolean) => {
    if (isSSOEnabled) return

    sendEventTelemetry({
      event: HELP_LINKS.cloud.event,
      eventData: {
        source: OAuthSocialSource.NavigationMenu,
      },
    })
  }

  return (
    <FeatureFlagComponent name={FeatureFlags.cloudAds}>
      <OAuthSsoHandlerDialog>
        {(ssoCloudHandlerClick, isSSOEnabled) => (
          <Link
            href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
              campaign: 'navigation_menu',
            })}
            style={{ marginInline: 'auto', backgroundColor: 'transparent' }}
            data-testid="create-cloud-db-link"
          >
            <SideBarItem
              tooltipProps={{
                text: 'Create FREE Redis Cloud database',
                placement: 'right',
              }}
              onClick={(e) => {
                onCLickLink(isSSOEnabled)
                ssoCloudHandlerClick(e, {
                  source: OAuthSocialSource.NavigationMenu,
                  action: OAuthSocialAction.Create,
                })
              }}
              style={{ marginInline: 'auto' }}
              data-testid="create-cloud-sidebar-item"
            >
              <SideBarItemIcon
                width="20px"
                height="20px"
                icon={CloudIcon}
                aria-label="cloud-db-icon"
                data-testid="cloud-db-icon"
              />
            </SideBarItem>
          </Link>
        )}
      </OAuthSsoHandlerDialog>
    </FeatureFlagComponent>
  )
}

export default CreateCloud
