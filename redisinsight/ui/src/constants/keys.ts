import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { ApiEndpoints } from 'uiSrc/constants'
import { CommandGroup } from './commands'

export enum KeyTypes {
  Hash = 'hash',
  List = 'list',
  Set = 'set',
  ZSet = 'zset',
  String = 'string',
  ReJSON = 'ReJSON-RL',
  JSON = 'json',
  Stream = 'stream',
  VectorSet = 'vectorset',
}

export enum ModulesKeyTypes {
  Graph = 'graphdata',
  TimeSeries = 'TSDB-TYPE',
}

export const GROUP_TYPES_DISPLAY = Object.freeze({
  [KeyTypes.Hash]: 'Hash',
  [KeyTypes.List]: 'List',
  [KeyTypes.Set]: 'Set',
  [KeyTypes.ZSet]: 'Sorted Set',
  [KeyTypes.String]: 'String',
  [KeyTypes.ReJSON]: 'JSON',
  [KeyTypes.JSON]: 'JSON',
  [KeyTypes.Stream]: 'Stream',
  [KeyTypes.VectorSet]: 'Vector Set',
  [ModulesKeyTypes.TimeSeries]: 'Time Series',
  [CommandGroup.Bitmap]: 'Bitmap',
  [CommandGroup.Cluster]: 'Cluster',
  [CommandGroup.Connection]: 'Connection',
  [CommandGroup.Geo]: 'Geo',
  [CommandGroup.Generic]: 'Generic',
  [CommandGroup.PubSub]: 'Pub/Sub',
  [CommandGroup.Scripting]: 'Scripting',
  [CommandGroup.Transactions]: 'Transactions',
  [CommandGroup.TimeSeries]: 'TimeSeries',
  [CommandGroup.Server]: 'Server',
  [CommandGroup.SortedSet]: 'Sorted Set',
  [CommandGroup.HyperLogLog]: 'HyperLogLog',
  [CommandGroup.CMS]: 'CMS',
  [CommandGroup.TDigest]: 'TDigest',
  [CommandGroup.TopK]: 'TopK',
  [CommandGroup.BloomFilter]: 'Bloom Filter',
  [CommandGroup.CuckooFilter]: 'Cuckoo Filter',
})

export type GroupTypesDisplay = keyof typeof GROUP_TYPES_DISPLAY

// Enums don't allow to use dynamic key
export const GROUP_TYPES_COLORS = Object.freeze({
  [KeyTypes.Hash]: 'var(--typeHashColor)',
  [KeyTypes.List]: 'var(--typeListColor)',
  [KeyTypes.Set]: 'var(--typeSetColor)',
  [KeyTypes.ZSet]: 'var(--typeZSetColor)',
  [KeyTypes.String]: 'var(--typeStringColor)',
  [KeyTypes.ReJSON]: 'var(--typeReJSONColor)',
  [KeyTypes.JSON]: 'var(--typeReJSONColor)',
  [KeyTypes.Stream]: 'var(--typeStreamColor)',
  [KeyTypes.VectorSet]: 'var(--typeVectorSetColor)',
  [ModulesKeyTypes.Graph]: 'var(--typeGraphColor)',
  [ModulesKeyTypes.TimeSeries]: 'var(--typeTimeSeriesColor)',
  [CommandGroup.SortedSet]: 'var(--groupSortedSetColor)',
  [CommandGroup.Bitmap]: 'var(--groupBitmapColor)',
  [CommandGroup.Cluster]: 'var(--groupClusterColor)',
  [CommandGroup.Connection]: 'var(--groupConnectionColor)',
  [CommandGroup.Geo]: 'var(--groupGeoColor)',
  [CommandGroup.Generic]: 'var(--groupGenericColor)',
  [CommandGroup.PubSub]: 'var(--groupPubSubColor)',
  [CommandGroup.Scripting]: 'var(--groupScriptingColor)',
  [CommandGroup.Transactions]: 'var(--groupTransactionsColor)',
  [CommandGroup.Server]: 'var(--groupServerColor)',
  [CommandGroup.HyperLogLog]: 'var(--groupHyperLolLogColor)',
})

export type GroupTypesColors = keyof typeof GROUP_TYPES_COLORS

export type KeyTypesActions = {
  [key: string]: {
    addItems?: {
      name: string
    }
    removeItems?: {
      name: string
    }
    editItem?: {
      name: string
    }
  }
}

export const STREAM_ADD_GROUP_VIEW_TYPES = [
  StreamViewType.Groups,
  StreamViewType.Consumers,
  StreamViewType.Messages,
]

export const STREAM_ADD_ACTION = Object.freeze({
  [StreamViewType.Data]: {
    name: 'New Entry',
  },
  [StreamViewType.Groups]: {
    name: 'New Group',
  },
  [StreamViewType.Consumers]: {
    name: 'New Group',
  },
  [StreamViewType.Messages]: {
    name: 'New Group',
  },
})

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface LengthNamingByType {
  [key: string]: string
}

export const LENGTH_NAMING_BY_TYPE: LengthNamingByType = Object.freeze({
  [ModulesKeyTypes.Graph]: 'Nodes',
  [ModulesKeyTypes.TimeSeries]: 'Samples',
  [KeyTypes.Stream]: 'Entries',
  [KeyTypes.ReJSON]: 'Top-level values',
})

export interface ModulesKeyTypesNames {
  [key: string]: string
}

export const MODULES_KEY_TYPES_NAMES: ModulesKeyTypesNames = Object.freeze({
  [ModulesKeyTypes.Graph]: 'RedisGraph',
  [ModulesKeyTypes.TimeSeries]: 'RedisTimeSeries',
})

export enum KeyValueFormat {
  Unicode = 'Unicode',
  ASCII = 'ASCII',
  JSON = 'JSON',
  HEX = 'HEX',
  Binary = 'Binary',
  Msgpack = 'Msgpack',
  PHP = 'PHP serialized',
  JAVA = 'Java serialized',
  Protobuf = 'Protobuf',
  Pickle = 'Pickle',
  Vector32Bit = 'Vector 32-bit',
  Vector64Bit = 'Vector 64-bit',
  DateTime = 'DateTime',
}

export const DATETIME_FORMATTER_DEFAULT = 'HH:mm:ss d MMM yyyy'

export enum KeyValueCompressor {
  GZIP = 'GZIP',
  ZSTD = 'ZSTD',
  LZ4 = 'LZ4',
  SNAPPY = 'SNAPPY',
  Brotli = 'Brotli',
  PHPGZCompress = 'PHPGZCompress',
}

export const COMPRESSOR_MAGIC_SYMBOLS: ICompressorMagicSymbols = Object.freeze({
  [KeyValueCompressor.GZIP]: '31,139', // 1f 8b hex
  [KeyValueCompressor.ZSTD]: '40,181,47,253', // 28 b5 2f fd hex
  [KeyValueCompressor.LZ4]: '4,34,77,24', // 04 22 4d 18 hex
  [KeyValueCompressor.SNAPPY]: '', // no magic symbols
  [KeyValueCompressor.Brotli]: '', // no magic symbols
  [KeyValueCompressor.PHPGZCompress]: '', // no magic symbols
})

export type ICompressorMagicSymbols = {
  [key in KeyValueCompressor]: string
}

export const ENDPOINT_BASED_ON_KEY_TYPE = Object.freeze({
  [KeyTypes.ZSet]: ApiEndpoints.ZSET,
  [KeyTypes.Set]: ApiEndpoints.SET,
  [KeyTypes.String]: ApiEndpoints.STRING,
  [KeyTypes.Hash]: ApiEndpoints.HASH,
  [KeyTypes.List]: ApiEndpoints.LIST,
  [KeyTypes.ReJSON]: ApiEndpoints.REJSON,
  [KeyTypes.Stream]: ApiEndpoints.STREAMS,
  [KeyTypes.VectorSet]: ApiEndpoints.VECTOR_SET,
})

export type EndpointBasedOnKeyType = keyof typeof ENDPOINT_BASED_ON_KEY_TYPE

export enum SearchHistoryMode {
  Pattern = 'pattern',
  Redisearch = 'redisearch',
}

export const ENTER = 'Enter'
export const SPACE = ' '
export const ESCAPE = 'Escape'
export const TAB = 'Tab'
export const BACKSPACE = 'Backspace'
export const F2 = 'F2'

export const ALT = 'Alt'
export const SHIFT = 'Shift'
export const CTRL = 'Control'
export const META = 'Meta' // Windows, Command, Option

export const ARROW_DOWN = 'ArrowDown'
export const ARROW_UP = 'ArrowUp'
export const ARROW_LEFT = 'ArrowLeft'
export const ARROW_RIGHT = 'ArrowRight'

export const PAGE_UP = 'PageUp'
export const PAGE_DOWN = 'PageDown'
export const END = 'End'
export const HOME = 'Home'

export enum KeyboardKeys {
  ENTER = 'Enter',
  SPACE = ' ',
  ESCAPE = 'Escape',
  TAB = 'Tab',
  BACKSPACE = 'Backspace',
  F2 = 'F2',
  ARROW_DOWN = 'ArrowDown',
  ARROW_UP = 'ArrowUp',
  ARROW_LEFT = 'ArrowLeft',
  ARROW_RIGHT = 'ArrowRight',
  PAGE_UP = 'PageUp',
  PAGE_DOWN = 'PageDown',
  END = 'End',
  HOME = 'Home',
}
