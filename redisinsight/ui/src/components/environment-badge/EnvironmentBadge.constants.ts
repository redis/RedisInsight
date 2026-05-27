import { Environment } from 'apiClient'

import { EnvironmentBadgeConfig } from './EnvironmentBadge.types'

export const PRODUCTION_TOOLTIP =
  'Production — Adds an extra layer of protection to prevent unintended changes. Includes additional confirmation dialogs before modifying data and stronger friction before running dangerous commands.'

export const DEVELOPMENT_TOOLTIP =
  'Development — Skips standard confirmation dialogs when modifying data, for faster work on development and test databases.'

export const BADGE_CONFIG: Partial<
  Record<Environment, EnvironmentBadgeConfig>
> = {
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
