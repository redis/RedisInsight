import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import { Loader } from 'uiSrc/components/base/display'

import * as S from '../OAuth.styles'

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
        <S.LoadingContainer>
          <S.Loading
            as={Loader}
            size="l"
            data-testid="oath-user-profile-spinner"
          />
        </S.LoadingContainer>
      )
    }

    return (
      <S.ProfileWrapper>
        <OAuthSignInButton source={source} />
      </S.ProfileWrapper>
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
      selectingAccountId={selectingAccountId}
    />
  )
}

export default OAuthUserProfile
