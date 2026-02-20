import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface UseRedisearchListDataReturn {
  loading: boolean | undefined
  data: RedisResponseBuffer[]
  stringData: string[]
}
