import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { RowSelectionState } from 'uiSrc/components/base/layout/table'

export type IndexFieldValue = string | number

export enum VectorAlgorithm {
  FLAT = 'FLAT',
  HNSW = 'HNSW',
}

export enum VectorDistanceMetric {
  COSINE = 'COSINE',
  L2 = 'L2',
  IP = 'IP',
}

export enum VectorDataType {
  FLOAT32 = 'FLOAT32',
  FLOAT64 = 'FLOAT64',
  FLOAT16 = 'FLOAT16',
  BFLOAT16 = 'BFLOAT16',
}

export interface VectorFieldOptionsBase {
  dimensions?: number
  distanceMetric?: VectorDistanceMetric
  dataType?: VectorDataType
}

export interface VectorFlatFieldOptions extends VectorFieldOptionsBase {
  algorithm: VectorAlgorithm.FLAT
}

export interface VectorHnswFieldOptions extends VectorFieldOptionsBase {
  algorithm: VectorAlgorithm.HNSW
  maxEdges?: number
  maxNeighbors?: number
  candidateLimit?: number
  epsilon?: number
}

export type VectorFieldOptions = VectorFlatFieldOptions | VectorHnswFieldOptions

export interface TextFieldOptions {
  weight?: number
  phonetic?: string
}

export type IndexFieldOptions = VectorFieldOptions | TextFieldOptions

export interface IndexField {
  id: string
  name: string
  value: IndexFieldValue
  type: FieldTypes
  options?: IndexFieldOptions
}

export enum IndexDetailsMode {
  Readonly = 'readonly',
  Editable = 'editable',
}

export enum IndexDetailsColumn {
  Selection = 'selection',
  Name = 'name',
  Value = 'value',
  Type = 'type',
  Actions = 'actions',
}

export interface IndexDetailsProps {
  fields: IndexField[]
  mode?: IndexDetailsMode
  showBorder?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  onFieldEdit?: (field: IndexField) => void
}

export interface IndexDetailsContainerProps {
  $showBorder?: boolean
}

export interface GetColumnsOptions {
  mode: IndexDetailsMode
  onFieldEdit?: (field: IndexField) => void
}
