import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { logoutUserAction } from 'uiSrc/slices/oauth/cloud'

import { buildRedisInsightUrl, getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import {
  fetchSubscriptionsRedisCloud,
  setSSOFlow,
} from 'uiSrc/slices/instances/cloud'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { FeatureFlagComponent } from 'uiSrc/components'
import { getConfig } from 'uiSrc/config'
import { CloudUser } from 'apiSrc/modules/cloud/user/models'
import { Link } from 'uiSrc/components/base/link/Link'
import { DownloadIcon, SignoutIcon } from '@redis-ui/icons'
import { Menu } from 'uiSrc/components/base/layout/menu'
import { ProfileIcon } from 'uiSrc/components/base/layout/profile-icon/ProfileIcon'
import Loader from 'uiSrc/components/base/display/loader/Loader'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'

export interface UserProfileBadgeProps {
  'data-testid'?: string
  error: Nullable<string>
  data: Nullable<CloudUser>
  handleClickSelectAccount?: (id: number) => void
  handleClickCloudAccount?: () => void
  selectingAccountId?: number
}

const riConfig = getConfig()

const UserProfileBadge = (props: UserProfileBadgeProps) => {
  const {
    error,
    data,
    handleClickSelectAccount,
    handleClickCloudAccount,
    selectingAccountId,
    'data-testid': dataTestId,
  } = props

  const connectedInstance = useSelector(connectedInstanceSelector)

  const riDesktopLink = buildRedisInsightUrl(connectedInstance)

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isImportLoading, setIsImportLoading] = useState(false)

  const dispatch = useDispatch()
  const history = useHistory()

  if (!data || error) {
    return null
  }

  const handleClickImport = () => {
    if (isImportLoading) return

    setIsImportLoading(true)
    dispatch(setSSOFlow(OAuthSocialAction.Import))
    dispatch(
      fetchSubscriptionsRedisCloud(
        null,
        true,
        () => {
          history.push(Pages.redisCloudSubscriptions)
          setIsImportLoading(false)
        },
        () => setIsImportLoading(false),
      ),
    )

    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_IMPORT_DATABASES_SUBMITTED,
      eventData: {
        source: OAuthSocialSource.UserProfile,
      },
    })
  }

  const handleClickLogout = () => {
    setIsProfileOpen(false)
    dispatch(
      logoutUserAction(() => {
        sendEventTelemetry({
          event: TelemetryEvent.CLOUD_SIGN_OUT_CLICKED,
        })
      }),
    )
  }

  const handleToggleProfile = () => {
    if (!isProfileOpen) {
      sendEventTelemetry({
        event: TelemetryEvent.CLOUD_PROFILE_OPENED,
      })
    }
    setIsProfileOpen((v) => !v)
  }

  const { accounts, currentAccountId, name } = data

  return (
    <OutsideClickDetector onOutsideClick={() => setIsProfileOpen(false)}>
      <div data-testid={dataTestId}>
        <Menu open={isProfileOpen}>
          <Menu.Trigger
            withButton
            onClick={handleToggleProfile}
            data-testid="user-profile-btn"
          >
            <ProfileIcon
              size="L"
              fullName={name}
              role="presentation"
              style={{ cursor: 'pointer' }}
            />
          </Menu.Trigger>
          <Menu.Content
            data-testid="user-profile-popover-content"
            style={{ minWidth: 330 }}
          >
            <FeatureFlagComponent
              name={FeatureFlags.envDependent}
              otherwise={
                <Menu.Content.Label
                  text="Account"
                  data-testid="profile-title"
                />
              }
            >
              <Menu.Content.Label
                text="Redis Cloud account"
                data-testid="profile-title"
              />
            </FeatureFlagComponent>
            <Menu.Content.Separator />
            <div data-testid="user-profile-popover-accounts">
              {accounts?.map(({ name, id }) => (
                <Menu.Content.Item.Compose
                  role="presentation"
                  key={id}
                  selected={id === selectingAccountId}
                  onClick={() => handleClickSelectAccount?.(id)}
                  data-testid={`profile-account-${id}${id === currentAccountId ? '-selected' : ''}`}
                >
                  <Menu.Content.Item.Text>
                    {`${name} #${id}`}
                  </Menu.Content.Item.Text>
                  {id === selectingAccountId && (
                    <Loader
                      size="m"
                      data-testid={`user-profile-selecting-account-${id}`}
                    />
                  )}
                  {id === currentAccountId && (
                    <Menu.Content.Item.Check
                      data-testid={`user-profile-selected-account-${id}`}
                    />
                  )}
                </Menu.Content.Item.Compose>
              ))}
            </div>
            <Menu.Content.Separator />
            <FeatureFlagComponent
              name={FeatureFlags.envDependent}
              otherwise={
                <>
                  <Menu.Content.Item.Compose>
                    <Menu.Content.Item.Text>
                      <Link
                        external
                        color="text"
                        href={riDesktopLink}
                        data-testid="open-ri-desktop-link"
                        variant="inline"
                      >
                        Open in Redis Insight Desktop version
                      </Link>
                    </Menu.Content.Item.Text>
                  </Menu.Content.Item.Compose>
                  <Menu.Content.Item.Compose>
                    <Menu.Content.Item.Text>
                      <Link
                        external
                        color="text"
                        variant="inline"
                        target="_blank"
                        href={riConfig.app.smConsoleRedirect}
                        data-testid="cloud-admin-console-link"
                      >
                        Back to Redis Cloud Admin console
                      </Link>
                    </Menu.Content.Item.Text>
                  </Menu.Content.Item.Compose>
                </>
              }
            >
              <Menu.Content.Item
                role="presentation"
                subHead="Import Cloud Databases"
                text=""
                icon={DownloadIcon}
                onSelect={handleClickImport}
                data-testid="profile-import-cloud-databases"
              />
              <Menu.Content.Item.Compose>
                <Menu.Content.Item.Text>
                  <Link
                    external
                    color="text"
                    variant="inline"
                    target="_blank"
                    href={getUtmExternalLink(EXTERNAL_LINKS.cloudConsole, {
                      campaign: 'cloud_account',
                    })}
                    onClick={handleClickCloudAccount}
                    data-testid="cloud-console-link"
                  >
                    Cloud Console:
                    <span data-testid="account-full-name"> {name}</span>
                  </Link>
                </Menu.Content.Item.Text>
              </Menu.Content.Item.Compose>
              <Menu.Content.Separator />
              <Menu.Content.Item
                role="presentation"
                subHead="Logout"
                text=""
                icon={SignoutIcon}
                onClick={handleClickLogout}
                data-testid="profile-logout"
              />
            </FeatureFlagComponent>
            <Menu.Content.DropdownArrow />
          </Menu.Content>
        </Menu>
      </div>
    </OutsideClickDetector>
  )
}

export default UserProfileBadge
