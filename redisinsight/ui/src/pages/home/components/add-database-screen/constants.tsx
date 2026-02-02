import { AllIconsType } from 'uiSrc/components/base/icons'
import { FeatureFlags } from 'uiSrc/constants'
import { AddDbType } from 'uiSrc/pages/home/constants'

export interface Values {
  connectionURL: string
}

export interface ConnectivityOptionConfig {
  id: string
  title: string
  type: AddDbType
  icon: AllIconsType
  featureFlag?: FeatureFlags
}

export interface ConnectivityOption extends ConnectivityOptionConfig {
  onClick: () => void
  loading?: boolean
}

export const CONNECTIVITY_OPTIONS_CONFIG: ConnectivityOptionConfig[] = [
  {
    id: 'sentinel',
    title: 'Redis Sentinel',
    type: AddDbType.sentinel,
    icon: 'ShieldIcon',
  },
  {
    id: 'software',
    title: 'Redis Software',
    type: AddDbType.software,
    icon: 'RedisSoftwareIcon',
  },
  {
    id: 'azure',
    title: 'Azure Managed Redis',
    type: AddDbType.azure,
    icon: 'CloudIcon',
    featureFlag: FeatureFlags.azureEntraId,
  },
  {
    id: 'import',
    title: 'Import from file',
    type: AddDbType.import,
    icon: 'DownloadIcon',
  },
]
