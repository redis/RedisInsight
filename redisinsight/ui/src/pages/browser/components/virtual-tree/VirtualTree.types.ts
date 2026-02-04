import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { Maybe, Nullable } from 'uiSrc/utils'
import { KeyTypes, ModulesKeyTypes, SortOrder } from 'uiSrc/constants'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'

export interface VirtualTreeProps {
  items: IKeyPropTypes[]
  delimiterPattern: string
  delimiters: string[]
  loadingIcon?: string
  loading: boolean
  deleting: boolean
  sorting: Maybe<SortOrder>
  commonFilterType: Nullable<KeyTypes>
  statusSelected: Nullable<string>
  statusOpen: OpenedNodes
  webworkerFn: (...args: any) => any
  onStatusOpen?: (name: string, value: boolean) => void
  onStatusSelected?: (key: RedisString) => void
  setConstructingTree: (status: boolean) => void
  onDeleteLeaf: (key: RedisResponseBuffer) => void
  onDeleteClicked: (type: KeyTypes | ModulesKeyTypes) => void
}

export interface OpenedNodes {
  [key: string]: boolean
}
