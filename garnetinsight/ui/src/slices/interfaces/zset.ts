import { RedisResponseBuffer } from 'uiSrc/slices/interfaces/app'
import { ModifiedZsetMembersResponse } from 'uiSrc/slices/interfaces/instances'

export interface ZsetMember {
  name: RedisResponseBuffer
  score: number
}

export interface StateZsetData extends ModifiedZsetMembersResponse {
  sortOrder?: string
  members: ZsetMember[]
}

export interface StateZset {
  loading: boolean
  searching: boolean
  error: string
  data: StateZsetData
  updateScore: {
    loading: boolean
    error: string
  }
}
