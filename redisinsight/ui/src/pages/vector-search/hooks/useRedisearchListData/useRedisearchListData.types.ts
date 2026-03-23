import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface UseRedisearchListDataReturn {
  loading: boolean | undefined
  error: string
  data: RedisResponseBuffer[]
  stringData: string[]
}
