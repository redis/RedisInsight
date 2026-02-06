import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface UseRedisearchListDataReturn {
  loading: boolean
  data: RedisResponseBuffer[]
  stringData: string[]
}
