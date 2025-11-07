import React from 'react'
import { FeatureFlagComponent, RiTooltip } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'

import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Spacer } from 'uiSrc/components/base/layout'
import { Row } from 'uiSrc/components/base/layout/flex'

export interface Props {
  value?: boolean
  onChange: (value: boolean) => void
}

const OAuthRecommendedSettings = (props: Props) => {
  const { value, onChange } = props

  return (
    <FeatureFlagComponent name={FeatureFlags.cloudSsoRecommendedSettings}>
      <Row align="start">
        <Checkbox
          id="ouath-recommended-settings"
          name="recommended-settings"
          label="Use a pre-selected provider and region"
          labelSize="M"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          data-testid="oauth-recommended-settings-checkbox"
        />
        <RiTooltip
          content={
            <>
              The database will be automatically created using a pre-selected
              provider and region.
              <br />
              You can change it by signing in to Redis Cloud.
            </>
          }
          position="top"
        >
          <RiIcon type="InfoIcon" size="l" />
        </RiTooltip>
      </Row>
      <Spacer size="s" />
    </FeatureFlagComponent>
  )
}

export default OAuthRecommendedSettings
