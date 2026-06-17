import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { KeyTypes, ModulesKeyTypes } from '../keys'

export interface IKeyPropTypes {
  nameString: string
  name: RedisResponseBuffer
  type: KeyTypes | ModulesKeyTypes
  ttl: number
  size: number
  length: number
  quantType?: string
  vectorDim?: number
  // Decimal string — u64 ARCOUNT exceeds `Number.MAX_SAFE_INTEGER`.
  count?: string
}

export interface IFetchKeyArgs {
  resetData?: boolean
  start?: number
  end?: number
}
