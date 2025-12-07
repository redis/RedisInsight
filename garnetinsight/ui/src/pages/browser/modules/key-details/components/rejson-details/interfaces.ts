import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export type JSONScalarValue = string | number | boolean | null

export type JSONObjectValue = JSONScalarValue | JSONScalarValue[]

export interface IJSONObject {
  [keyName: string]: IJSONValue
}

export enum ObjectTypes {
  Object = 'object',
  Array = 'array',
}
export type JSONArrayValue = IJSONObject | JSONObjectValue
export type IJSONValue =
  | JSONScalarValue
  | IJSONObject
  | JSONObjectValue
  | JSONArrayValue[]

export interface IJSONDocument {
  key: string
  type: string
  cardinality?: number
  value: IJSONValue
}

export interface REJSONResponse {
  type: string
  downloaded: boolean
  data: JSONArrayValue[] | IJSONDocument
}

interface UpdateValueBody {
  // This interface has been kept empty for now.
  // If any changes is to be made to the body format for updating purpose , the necessary properties will be added here.
}

export type IJSONData = IJSONValue | IJSONDocument | IJSONDocument[]

export interface BaseProps {
  length?: number
  data: IJSONData
  dataType: string
  parentPath?: string
  selectedKey: RedisResponseBuffer
  isDownloaded: boolean
  onJsonKeyExpandAndCollapse: (isExpanded: boolean, path: string) => void
  expandedRows: Set<string>
}

export interface DynamicTypesProps {
  data: IJSONData
  parentPath?: string
  leftPadding?: number
  expandedRows: Set<string>
  selectedKey: RedisResponseBuffer
  isDownloaded: boolean
  onClickRemoveKey: (path: string, keyName: string) => void
  onClickFunc?: (path: string) => void
  onJsonKeyExpandAndCollapse: (isExpanded: boolean, path: string) => void
  handleSubmitUpdateValue?: (body: UpdateValueBody) => void
  handleFetchVisualisationResults: (
    path: string,
    forceRetrieve?: boolean,
  ) => Promise<any>
  handleAppendRejsonObjectItemAction: (
    keyName: RedisResponseBuffer,
    path: string,
    data: string,
  ) => void
  handleSetRejsonDataAction: (
    keyName: RedisResponseBuffer,
    path: string,
    data: string,
  ) => void
}

interface JSONCommonProps {
  keyName: string | number
  value: string | number | boolean | bigint
  cardinality?: number
  selectedKey: RedisResponseBuffer
  path?: string
  parentPath: string
  leftPadding: number
  handleSubmitRemoveKey: (path: string, jsonKeyName: string) => void
}

export interface JSONScalarProps extends JSONCommonProps {
  isRoot?: boolean
}

export interface JSONObjectProps extends JSONCommonProps {
  type: ObjectTypes
  isDownloaded: boolean
  expandedRows: Set<string>
  onJsonKeyExpandAndCollapse: (isExpanded: boolean, path: string) => void
  onClickRemoveKey: (path: string, keyName: string) => void
  handleSubmitUpdateValue?: (body: UpdateValueBody) => void
  handleSetRejsonDataAction: (
    keyName: RedisResponseBuffer,
    path: string,
    data: string,
  ) => void
  handleAppendRejsonObjectItemAction: (
    keyName: RedisResponseBuffer,
    path: string,
    data: string,
  ) => void
  handleFetchVisualisationResults: (
    path: string,
    forceRetrieve?: boolean,
  ) => Promise<any>
}
