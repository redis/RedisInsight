export enum DecoderType {
  Binary = 'binary',
}

export type FieldSizeSource = 'fixed' | 'field'

export interface BinaryFieldDefinition {
  id: string
  kind: 'field'
  name: string
  dataType: string
  size: number | ''
  sizeSource?: FieldSizeSource
  /** Field id of a prior numeric field used as dynamic byte length */
  sizeFieldRef?: string
}

export interface RepeatBlockDefinition {
  id: string
  kind: 'repeat'
  name: string
  /** Field id of a prior numeric field used as repeat count */
  countFieldRef: string
  fields: SchemaNode[]
}

export type SchemaNode = BinaryFieldDefinition | RepeatBlockDefinition

export interface ValueDecoderRule {
  id: string
  name: string
  keyPatterns: string[]
  decoderType: DecoderType
  schema: SchemaNode[]
  /** @deprecated Legacy single pattern — migrated to keyPatterns on load */
  keyPattern?: string
  /** @deprecated Legacy flat fields — migrated to schema on load */
  fields?: Omit<BinaryFieldDefinition, 'kind'>[]
}

export interface ParsedBinaryField {
  kind: 'field'
  name: string
  size: number
  value: string
}

export interface ParsedBinaryGroup {
  kind: 'group'
  label: string
  children: ParsedBinaryNode[]
}

export type ParsedBinaryNode = ParsedBinaryField | ParsedBinaryGroup
