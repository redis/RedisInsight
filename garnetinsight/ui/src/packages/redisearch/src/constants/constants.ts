export const InfoAttributesBoolean: string[] = ['NOSTEM', 'NOINDEX', 'SORTABLE']

export enum Command {
  Search = 'FT.SEARCH',
  Aggregate = 'FT.AGGREGATE',
  Info = 'FT.INFO',
  Profile = 'FT.PROFILE',
}

export enum ProfileType {
  Search = 'SEARCH',
  Aggregate = 'AGGREGATE',
}

export enum CommandArgument {
  NoContent = 'NOCONTENT',
  Return = 'RETURN',
  Highlight = 'HIGHLIGHT',
  WithScores = 'WITHSCORES',
  WithPayloads = 'WITHPAYLOADS',
  WithSortKeys = 'WITHSORTKEYS',
}

export enum ResultFieldNameView {
  Score = 'Score',
  Payloads = 'Payloads',
  Name = 'Name',
}

export enum ResultInfoField {
  Attributes = 'attributes',
  Fields = 'fields',
  Options = 'index_options',
}

export const ResultInfoAttributes: string[] = [
  'Name',
  'Type',
  'WEIGHT',
  'NOSTEM',
  'NOINDEX',
  'SORTABLE',
  'SEPARATOR',
  'PHONETIC',
]

export enum KeyTypes {
  Hash = 'hash',
  List = 'list',
  Set = 'set',
  ZSet = 'zset',
  String = 'string',
  ReJSON = 'ReJSON-RL',
  JSON = 'json',
}

export const GROUP_TYPES_DISPLAY = Object.freeze({
  [KeyTypes.Hash]: 'Hash',
  [KeyTypes.List]: 'List',
  [KeyTypes.Set]: 'Set',
  [KeyTypes.ZSet]: 'Zset',
  [KeyTypes.String]: 'String',
  [KeyTypes.ReJSON]: 'JSON',
  [KeyTypes.JSON]: 'JSON',
})

// Enums don't allow to use dynamic key
export const GROUP_TYPES_COLORS = Object.freeze({
  [KeyTypes.Hash]: 'var(--typeHashColor)',
  [KeyTypes.List]: 'var(--typeListColor)',
  [KeyTypes.Set]: 'var(--typeSetColor)',
  [KeyTypes.ZSet]: 'var(--typeZSetColor)',
  [KeyTypes.String]: 'var(--typeStringColor)',
  [KeyTypes.ReJSON]: 'var(--typeReJSONColor)',
  [KeyTypes.JSON]: 'var(--typeReJSONColor)',
})
