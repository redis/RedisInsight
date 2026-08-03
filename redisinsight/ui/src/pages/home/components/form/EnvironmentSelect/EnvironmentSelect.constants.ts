import { ParseKeys } from 'i18next'
import { Environment } from 'apiClient'

export const ENVIRONMENT_OPTIONS: { value: Environment; label: ParseKeys }[] = [
  {
    value: Environment.Unspecified,
    label: 'home.form.environment.unspecified',
  },
  { value: Environment.Production, label: 'home.form.environment.production' },
  {
    value: Environment.Development,
    label: 'home.form.environment.development',
  },
]
