import React from 'react'
import { useSelector } from 'react-redux'
import { Environment } from 'apiClient'

import { appFeatureFlagDevProdModeSelector } from 'uiSrc/slices/app/features'
import {
  RiBadge,
  BadgeVariants,
} from 'uiSrc/components/base/display/badge/RiBadge'
import { RiTooltip } from 'uiSrc/components/base/tooltip/RITooltip'

export interface EnvironmentBadgeProps {
  environment?: Environment
  dataTestId?: string
}

interface EnvironmentBadgeConfig {
  label: string
  variant: BadgeVariants
  tooltip: React.ReactNode
}

const PRODUCTION_TOOLTIP =
  'Production — Adds an extra layer of protection to prevent unintended changes. Includes additional confirmation dialogs before modifying data and stronger friction before running dangerous commands.'

const DEVELOPMENT_TOOLTIP =
  'Development — Skips standard confirmation dialogs when modifying data, for faster work on development and test databases.'

const BADGE_CONFIG: Partial<Record<Environment, EnvironmentBadgeConfig>> = {
  [Environment.Production]: {
    label: 'PROD',
    variant: 'danger',
    tooltip: PRODUCTION_TOOLTIP,
  },
  [Environment.Development]: {
    label: 'DEV',
    variant: 'default',
    tooltip: DEVELOPMENT_TOOLTIP,
  },
}

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
