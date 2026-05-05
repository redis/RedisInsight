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
  arrayLogicalLength?: string
  arrayNextIndex?: string
}

export interface IFetchKeyArgs {
  resetData?: boolean
  start?: number
  end?: number
}
