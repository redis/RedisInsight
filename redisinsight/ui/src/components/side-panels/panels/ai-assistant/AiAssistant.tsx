import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { clearExpertChatHistory } from 'uiSrc/slices/panels/aiAssistant'
import { WelcomeAiAssistant, ChatsWrapper } from './components'
import * as S from '../../SidePanels.styles'

const AiAssistant = () => {
  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)
  const { [FeatureFlags.cloudSso]: cloudSsoFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const currentAccountIdRef = useRef(userOAuthProfile?.id)
  const isShowAuth = cloudSsoFeature?.flag && !userOAuthProfile

  const dispatch = useDispatch()

  useEffect(() => {
    // user logout
    if (currentAccountIdRef.current && !userOAuthProfile?.id) {
      dispatch(clearExpertChatHistory())
    }

    currentAccountIdRef.current = userOAuthProfile?.id
  }, [userOAuthProfile])

  return (
    <S.AiWrapper data-testid="redis-copilot">
      {isShowAuth ? <WelcomeAiAssistant /> : <ChatsWrapper />}
    </S.AiWrapper>
  )
}

export default AiAssistant
