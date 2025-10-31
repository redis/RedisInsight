import { AddDbType } from 'uiSrc/pages/home/constants'
import { DownloadIcon, IconType, RedisSoftwareIcon, ShieldIcon } from 'uiSrc/components/base/icons'

export interface Values {
  connectionURL: string
}

export interface ConnectivityOption {
  id: string
  title: string
  type: AddDbType
  icon: IconType
}

export const CONNECTIVITY_OPTIONS: ConnectivityOption[] = [
  {
    id: 'sentinel',
    title: 'Redis Sentinel',
    type: AddDbType.sentinel,
    icon: ShieldIcon,
  },
  {
    id: 'software',
    title: 'Redis Software',
    type: AddDbType.software,
    icon: RedisSoftwareIcon,
  },
  {
    id: 'import',
    title: 'Import from file',
    type: AddDbType.import,
    icon: DownloadIcon,
  },
]
