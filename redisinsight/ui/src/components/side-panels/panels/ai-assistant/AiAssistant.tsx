import React, { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { clearExpertChatHistory } from 'uiSrc/slices/panels/aiAssistant'
import { WelcomeAiAssistant, ChatsWrapper } from './components'
import styles from './styles.module.scss'

const AiAssistant = () => {
  const { data: userOAuthProfile } = useAppSelector(oauthCloudUserSelector)
  const { [FeatureFlags.cloudSso]: cloudSsoFeature } = useAppSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const currentAccountIdRef = useRef(userOAuthProfile?.id)
  const isShowAuth = cloudSsoFeature?.flag && !userOAuthProfile

  const dispatch = useAppDispatch()

  useEffect(() => {
    // user logout
    if (currentAccountIdRef.current && !userOAuthProfile?.id) {
      dispatch(clearExpertChatHistory())
    }

    currentAccountIdRef.current = userOAuthProfile?.id
  }, [userOAuthProfile])

  return (
    <div className={styles.wrapper} data-testid="redis-copilot">
      {isShowAuth ? <WelcomeAiAssistant /> : <ChatsWrapper />}
    </div>
  )
}

export default AiAssistant
