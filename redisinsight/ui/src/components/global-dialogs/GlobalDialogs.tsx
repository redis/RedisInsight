import React from 'react'
import {
  FeatureFlagComponent,
  OAuthSelectAccountDialog,
  OAuthSelectPlan,
  OAuthSsoDialog,
} from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'

const GlobalDialogs = () => (
  <>
    {/* <FeatureFlagComponent name={FeatureFlags.cloudSso}> */}
    <OAuthSelectAccountDialog />
    <OAuthSelectPlan />
    <OAuthSsoDialog />
    {/* </FeatureFlagComponent> */}
  </>
)

export default GlobalDialogs
