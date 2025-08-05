import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { logoutUserAction } from 'uiSrc/slices/oauth/cloud'

import { buildRedisInsightUrl, getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSocialAction, OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { getTruncatedName, Nullable } from 'uiSrc/utils'
import {
  fetchSubscriptionsRedisCloud,
  setSSOFlow,
} from 'uiSrc/slices/instances/cloud'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { FeatureFlagComponent } from 'uiSrc/components'
import { RiPopover } from 'uiSrc/components/base'
import { getConfig } from 'uiSrc/config'
import { RiText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'
import { UserProfileLink, RiLoader } from 'uiSrc/components/base/display'
import { CloudUser } from 'apiSrc/modules/cloud/user/models'
import styles from './styles.module.scss'

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
    <div className={styles.wrapper} data-testid={dataTestId}>
      <RiPopover
        ownFocus
        anchorPosition="upRight"
        isOpen={isProfileOpen}
        closePopover={() => setIsProfileOpen(false)}
        panelClassName={cx('popoverLikeTooltip', styles.popover)}
        button={
          <div
            role="presentation"
            onClick={handleToggleProfile}
            className={styles.profileBtn}
            data-testid="user-profile-btn"
          >
            {getTruncatedName(name) || 'R'}
          </div>
        }
      >
        <div
          className={styles.popoverOptions}
          data-testid="user-profile-popover-content"
        >
          <div className={styles.option}>
            <FeatureFlagComponent
              name={FeatureFlags.envDependent}
              otherwise={
                <RiText
                  className={styles.optionTitle}
                  data-testid="profile-title"
                >
                  Account
                </RiText>
              }
            >
              <RiText className={styles.optionTitle} data-testid="profile-title">
                Redis Cloud account
              </RiText>
            </FeatureFlagComponent>
            <div
              className={styles.accounts}
              data-testid="user-profile-popover-accounts"
            >
              {accounts?.map(({ name, id }) => (
                <div
                  role="presentation"
                  key={id}
                  className={cx(styles.account, {
                    [styles.isCurrent]: id === currentAccountId,
                    [styles.isSelected]:
                      id === currentAccountId && accounts?.length > 1,
                    [styles.isDisabled]: selectingAccountId,
                  })}
                  onClick={() => handleClickSelectAccount?.(id)}
                  data-testid={`profile-account-${id}${id === currentAccountId ? '-selected' : ''}`}
                >
                  <RiText className={styles.accountNameId}>
                    <span className={styles.accountName}>{name}</span> #{id}
                  </RiText>
                  {id === currentAccountId && (
                    <RiIcon
                      type="CheckThinIcon"
                      data-testid={`user-profile-selected-account-${id}`}
                    />
                  )}
                  {id === selectingAccountId && (
                    <RiLoader
                      className={styles.loadingSpinner}
                      size="m"
                      data-testid={`user-profile-selecting-account-${id}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <FeatureFlagComponent
            name={FeatureFlags.envDependent}
            otherwise={
              <>
                <UserProfileLink
                  href={riDesktopLink}
                  data-testid="open-ri-desktop-link"
                >
                  <RiText>Open in Redis Insight Desktop version</RiText>
                </UserProfileLink>
                <UserProfileLink
                  target="_blank"
                  href={riConfig.app.smConsoleRedirect}
                  data-testid="cloud-admin-console-link"
                >
                  <RiText>Back to Redis Cloud Admin console</RiText>
                  <RiIcon
                    type="CloudIcon"
                    style={{ fill: 'none' }}
                    viewBox="-1 0 30 20"
                    strokeWidth={1.8}
                  />
                </UserProfileLink>
              </>
            }
          >
            <div
              role="presentation"
              className={cx(styles.option, styles.clickableOption, {
                [styles.isDisabled]: isImportLoading,
              })}
              onClick={handleClickImport}
              data-testid="profile-import-cloud-databases"
            >
              <RiText className={styles.optionTitle}>Import Cloud databases</RiText>
              {isImportLoading ? (
                <RiLoader className={styles.loadingSpinner} size="m" />
              ) : (
                <RiIcon type="DownloadIcon" />
              )}
            </div>
            <UserProfileLink
              target="_blank"
              href={getUtmExternalLink(EXTERNAL_LINKS.cloudConsole, {
                campaign: 'cloud_account',
              })}
              onClick={handleClickCloudAccount}
              data-testid="cloud-console-link"
            >
              <div className={styles.optionTitleWrapper}>
                <RiText className={styles.optionTitle}>Cloud Console</RiText>
                <RiText
                  className={cx('truncateText', styles.accountFullName)}
                  data-testid="account-full-name"
                >
                  {name}
                </RiText>
              </div>
              <RiIcon
                type="CloudIcon"
                style={{ fill: 'none' }}
                viewBox="-1 0 30 20"
                strokeWidth={1.8}
              />
            </UserProfileLink>
            <div
              role="presentation"
              className={cx(styles.option, styles.clickableOption)}
              onClick={handleClickLogout}
              data-testid="profile-logout"
            >
              <RiText className={styles.optionTitle}>Logout</RiText>
              <RiIcon type="ExportIcon" />
            </div>
          </FeatureFlagComponent>
        </div>
      </RiPopover>
    </div>
  )
}

export default UserProfileBadge
