import { FixedSizeNodeData } from 'react-vtree'
import {
  BrowserColumns,
  KeyTypes,
  ModulesKeyTypes,
  SortOrder,
} from 'uiSrc/constants'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { Maybe, Nullable } from 'uiSrc/utils'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'

export interface TreeNode {
  children: TreeNode[]
  id: number
  keyCount: number
  keyApproximate: number
  fullName: string
  name: string
  keys: any[]
  [key: string]: any
}

export interface NodeMeta {
  nestingLevel: number
  node: TreeNode
  data: NodeMetaData
}

export interface NodeMetaData {
  id: string
  isLeaf: boolean
  keyCount: number
  name: string
  fullName: string
  updateStatusSelected: (fullName: string, keys: any) => void
  updateStatusOpen: (name: string, value: boolean) => void
  keyApproximate: number
  isSelected: boolean
  isOpenByDefault: boolean
}

export interface TreeData extends FixedSizeNodeData {
  isLeaf: boolean
  name: string
  nameString: string
  nameBuffer: RedisResponseBuffer
  path: string
  keyCount: number
  keyApproximate: number
  fullName: string
  shortName?: string
  type: KeyTypes | ModulesKeyTypes
  ttl: number
  size: number
  nestingLevel: number
  deleting: boolean
  isSelected: boolean
  delimiters: string[]
  children?: TreeData[]
  updateStatusOpen: (fullName: string, value: boolean) => void
  updateStatusSelected: (key: RedisString) => void
  getMetadata: (key: RedisString, path: string) => void
  onDelete: (key: RedisResponseBuffer) => void
  onDeleteClicked: (type: KeyTypes | ModulesKeyTypes) => void
  onDeleteFolder?: (pattern: string, fullName: string, keyCount: number) => void
  visibleColumns?: BrowserColumns[]
  showFolderMetadata?: boolean
}

export interface OpenedNodes {
  [key: string]: boolean
}

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
  onDeleteFolder?: (pattern: string, fullName: string, keyCount: number) => void
  visibleColumns?: BrowserColumns[]
  showFolderMetadata?: boolean
}
