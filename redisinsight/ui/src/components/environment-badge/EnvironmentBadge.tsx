import React from 'react'
import { useSelector } from 'react-redux'

import { appFeatureFlagDevProdModeSelector } from 'uiSrc/slices/app/features'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { RiTooltip } from 'uiSrc/components/base/tooltip/RITooltip'

import { EnvironmentBadgeProps } from './EnvironmentBadge.types'
import { BADGE_CONFIG } from './EnvironmentBadge.constants'

export const EnvironmentBadge = ({
  environment,
  dataTestId,
}: EnvironmentBadgeProps) => {
  const flagEnabled = useSelector(appFeatureFlagDevProdModeSelector)

  if (!flagEnabled || !environment) return null

  const config = BADGE_CONFIG[environment]
  if (!config) return null

  return (
    <RiTooltip content={config.tooltip} position="bottom">
      <RiBadge
        label={config.label}
        variant={config.variant}
        data-testid={dataTestId ?? `environment-badge-${environment}`}
      />
    </RiTooltip>
  )
}

export default EnvironmentBadge
