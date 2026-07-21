import { ParseKeys } from 'i18next'

import { AllIconsType } from 'uiSrc/components/base/icons'
import { AddDbType } from 'uiSrc/pages/home/constants'

export interface Values {
  connectionURL: string
}

export interface ConnectivityOptionConfig {
  id: string
  title: ParseKeys
  type: AddDbType
  icon: AllIconsType
}

export interface ConnectivityOption extends ConnectivityOptionConfig {
  onClick: () => void
  loading?: boolean
  onCancel?: () => void
}

export const CONNECTIVITY_OPTIONS_CONFIG: ConnectivityOptionConfig[] = [
  {
    id: 'sentinel',
    title: 'addDatabase.option.sentinel',
    type: AddDbType.sentinel,
    icon: 'ShieldIcon',
  },
  {
    id: 'software',
    title: 'addDatabase.option.software',
    type: AddDbType.software,
    icon: 'RedisSoftwareIcon',
  },
  {
    id: 'azure',
    title: 'addDatabase.option.azure',
    type: AddDbType.azure,
    icon: 'CloudIcon',
  },
  {
    id: 'import',
    title: 'addDatabase.option.import',
    type: AddDbType.import,
    icon: 'DownloadIcon',
  },
]
