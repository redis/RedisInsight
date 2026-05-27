import React from 'react'
import { Environment } from 'apiClient'

import { BadgeVariants } from 'uiSrc/components/base/display/badge/RiBadge'

export interface EnvironmentBadgeProps {
  environment?: Environment
  dataTestId?: string
}

export interface EnvironmentBadgeConfig {
  label: string
  variant: BadgeVariants
  tooltip: React.ReactNode
}
