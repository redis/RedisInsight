export interface ICommands {
  [key: string]: ICommand
}

export interface ICommand {
  name?: string
  summary: string
  complexity?: string
  arguments?: ICommandArg[]
  since: string
  group: CommandGroup | string
  provider?: string
}

export enum CommandProvider {
  Main = 'main',
  Unknown = 'unknown',
}

export interface ICommandArg {
  name?: string[] | string
  type?: CommandArgsType[] | CommandArgsType | string | string[]
  optional?: boolean
  enum?: string[]
  block?: ICommandArg[]
  command?: string
  multiple?: boolean
  variadic?: boolean
  dsl?: string
}

export enum ICommandTokenType {
  PureToken = 'pure-token',
  Block = 'block',
  OneOf = 'oneof',
  String = 'string',
  Double = 'double',
  Enum = 'enum',
  Integer = 'integer',
  Key = 'key',
  POSIXTime = 'posix time',
  Pattern = 'pattern',
}

export interface IRedisCommand {
  name?: string
  summary?: string
  expression?: boolean
  type?: ICommandTokenType
  token?: string
  optional?: boolean
  multiple?: boolean
  arguments?: IRedisCommand[]
  variadic?: boolean
  dsl?: string
}

export interface IRedisCommandTree extends IRedisCommand {
  parent?: IRedisCommandTree
}

export interface ICommandArgGenerated extends ICommandArg {
  generatedName?: string | string[]
}

export enum CommandArgsType {
  Block = 'block',
  Double = 'double',
  Enum = 'enum',
  Integer = 'integer',
  Key = 'key',
  POSIXTime = 'posix time',
  Pattern = 'pattern',
  String = 'string',
  Type = 'type',
}

export enum CommandGroup {
  Cluster = 'cluster',
  Connection = 'connection',
  Geo = 'geo',
  Bitmap = 'bitmap',
  Generic = 'generic',
  PubSub = 'pubsub',
  Scripting = 'scripting',
  Transactions = 'transactions',
  Server = 'server',
  SortedSet = 'sorted-set',
  HyperLogLog = 'hyperloglog',
  Hash = 'hash',
  Set = 'set',
  Stream = 'stream',
  List = 'list',
  String = 'string',
  Search = 'search',
  JSON = 'json',
  TimeSeries = 'timeseries',
  Graph = 'graph',
  AI = 'ai',
  TDigest = 'tdigest',
  CMS = 'cms',
  TopK = 'topk',
  BloomFilter = 'bf',
  CuckooFilter = 'cf',
}

export enum CommandPrefix {
  AI = 'AI',
  Graph = 'GRAPH',
  TimeSeries = 'TS',
  Search = 'FT',
  JSON = 'JSON',
  Gears = 'RG',
  BloomFilter = 'BF',
  CuckooFilter = 'CF',
  CountMinSketchFilter = 'CMS',
  TopK = 'TOPK',
}

export const CommandMonitor = 'MONITOR'
export const CommandPSubscribe = 'PSUBSCRIBE'
export const CommandSubscribe = 'SUBSCRIBE'
export const CommandHello3 = 'HELLO 3'

export enum CommandRediSearch {
  Search = 'FT.SEARCH',
  Aggregate = 'FT.AGGREGATE',
  Info = 'FT.INFO',
}

export const commandsWBTableView = [
  CommandRediSearch.Search,
  CommandRediSearch.Aggregate,
]
export const commandsWBTablePartView = [CommandRediSearch.Info]

export enum CommandRSSearchArgument {
  NoContent = 'NOCONTENT',
  Return = 'RETURN',
  Highlight = 'HIGHLIGHT',
  WithScores = 'WITHSCORES',
  WithPayloads = 'WITHPAYLOADS',
  WithSortKeys = 'WITHSORTKEYS',
}

export enum DSL {
  cypher = 'cypher',
  lua = 'lua',
  sqliteFunctions = 'sqliteFunctions',
  jmespath = 'jmespath',
}

export interface IDSLNaming {
  [key: string]: string
}

export const DSLNaming: IDSLNaming = {
  [DSL.cypher]: 'Cypher',
  [DSL.lua]: 'Lua',
  [DSL.sqliteFunctions]: 'SQLite functions',
  [DSL.jmespath]: 'JMESPath',
}
