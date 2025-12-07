import { RedisResponseBuffer } from 'uiSrc/slices/interfaces/app'
import { ModifiedGetHashMembersResponse } from 'uiSrc/slices/interfaces/instances'

export interface HashField {
  field: RedisResponseBuffer
  value: RedisResponseBuffer
}

export interface StateHashData extends ModifiedGetHashMembersResponse {
  fields: HashField[]
}

export interface StateHash {
  loading: boolean
  error: string
  data: StateHashData
  updateValue: {
    loading: boolean
    error: string
  }
}
