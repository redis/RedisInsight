import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import OAuthSignInButton from 'uiSrc/components/oauth/oauth-sign-in-button'
import {
  activateAccount,
  oauthCloudUserSelector,
  setInitialLoadingState,
} from 'uiSrc/slices/oauth/cloud'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { PackageType } from 'uiSrc/constants/env'
import UserProfileBadge from 'uiSrc/components/instance-header/components/user-profile/UserProfileBadge'
import { RiLoader } from 'uiSrc/components/base/display'

import styles from './styles.module.scss'

export interface Props {
  source: OAuthSocialSource
}

const OAuthUserProfile = (props: Props) => {
  const { source } = props
  const [selectingAccountId, setSelectingAccountId] = useState<number>()
  const { error, data, initialLoading } = useSelector(oauthCloudUserSelector)
  const { server } = useSelector(appInfoSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    if (data || error) {
      dispatch(setInitialLoadingState(false))
    }
  }, [data, error])

  if (!data) {
    if (server?.packageType === PackageType.Mas) return null

    if (initialLoading) {
      return (
        <div className={styles.loadingContainer}>
          <RiLoader
            className={cx('infiniteMessage__icon', styles.loading)}
            size="l"
            data-testid="oath-user-profile-spinner"
          />
        </div>
      )
    }

    return (
      <div className={styles.wrapper}>
        <OAuthSignInButton source={source} />
      </div>
    )
  }

  const handleClickSelectAccount = (id: number) => {
    if (selectingAccountId) return

    setSelectingAccountId(id)
    dispatch(
      activateAccount(
        `${id}`,
        () => {
          setSelectingAccountId(undefined)
          sendEventTelemetry({
            event: TelemetryEvent.CLOUD_ACCOUNT_SWITCHED,
          })
        },
        () => {
          setSelectingAccountId(undefined)
        },
      ),
    )
  }

  const handleClickCloudAccount = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CLOUD_CONSOLE_CLICKED,
    })
  }

  return (
    <UserProfileBadge
      error={error}
      data={data}
      handleClickCloudAccount={handleClickCloudAccount}
      handleClickSelectAccount={handleClickSelectAccount}
      data-testid="oauth-user-profile-badge"
    />
  )
}

export default OAuthUserProfile
