import React from 'react'
import {
  FeatureFlagComponent,
  OAuthSelectAccountDialog,
  OAuthSelectPlan,
  OAuthSsoDialog,
} from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'
import WhatsNewModal from 'uiSrc/components/whats-new'

const GlobalDialogs = () => (
  <>
    <FeatureFlagComponent name={FeatureFlags.cloudSso}>
      <OAuthSelectAccountDialog />
      <OAuthSelectPlan />
      <OAuthSsoDialog />
    </FeatureFlagComponent>
    <WhatsNewModal />
  </>
)

export default GlobalDialogs
