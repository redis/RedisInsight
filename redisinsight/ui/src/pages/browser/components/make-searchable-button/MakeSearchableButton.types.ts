import { KeyTypes } from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface MakeSearchableButtonProps {
  keyName: RedisResponseBuffer
  keyNameString: string
  keyType: KeyTypes
  instanceId: string
}
