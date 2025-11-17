import { type RedisCloudAccount } from 'uiSrc/slices/interfaces'
import { type Nullable } from 'uiSrc/utils'

export interface AccountProps {
  account: RedisCloudAccount
}

export interface AccountValueProps {
  value?: Nullable<string | number>
  'data-testid'?: string
}

