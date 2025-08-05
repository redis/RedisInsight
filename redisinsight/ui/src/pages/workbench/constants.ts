import { AllIconsType } from 'uiSrc/components/base/icons'

export const WORKBENCH_HISTORY_WRAPPER_NAME = 'WORKBENCH'
export const WORKBENCH_HISTORY_MAX_LENGTH = 30

export enum WBQueryType {
  Text = 'Text',
  Plugin = 'Plugin',
}

export const DEFAULT_TEXT_VIEW_TYPE = {
  id: 'default__Text',
  text: 'Text',
  name: 'default__Text',
  value: WBQueryType.Text,
  iconDark: 'TextViewIconDarkIcon' as AllIconsType,
  iconLight: 'TextViewIconLightIcon' as AllIconsType,
  internal: true,
}

export const VIEW_TYPE_OPTIONS = [DEFAULT_TEXT_VIEW_TYPE]

export const getViewTypeOptions = () => [...VIEW_TYPE_OPTIONS]

export const SEARCH_COMMANDS = ['ft.search', 'ft.aggregate']
export const GRAPH_COMMANDS = ['graph.query']

const ALLOWED_PROFILE_COMMANDS = [...SEARCH_COMMANDS, ...GRAPH_COMMANDS]

export const isCommandAllowedForProfile = (query: string) =>
  ALLOWED_PROFILE_COMMANDS.includes(query?.split(' ')?.[0]?.toLowerCase())

export enum ProfileQueryType {
  Profile = 'Profile',
  Explain = 'Explain',
}

const PROFILE_VIEW_TYPE_OPTIONS = [
  {
    id: ProfileQueryType.Profile,
    text: 'Profile the command',
    name: 'Profile',
    value: WBQueryType.Text,
  },
  {
    id: ProfileQueryType.Explain,
    text: 'Explain the command',
    name: 'Explain',
    value: WBQueryType.Text,
  },
]

export const getProfileViewTypeOptions = () => [...PROFILE_VIEW_TYPE_OPTIONS]

export enum ModuleCommandPrefix {
  RediSearch = 'FT.',
  JSON = 'JSON.',
  TimeSeries = 'TS.',
  Graph = 'GRAPH.',
  BF = 'BF.',
  CF = 'CF.',
  CMS = 'CMS.',
  TOPK = 'TOPK.',
  TDIGEST = 'TDIGEST.',
}

export const COMMANDS_TO_GET_INDEX_INFO = [
  'FT.SEARCH',
  'FT.AGGREGATE',
  'FT.EXPLAIN',
  'FT.EXPLAINCLI',
  'FT.PROFILE',
  'FT.SPELLCHECK',
  'FT.TAGVALS',
  'FT.ALTER',
]

export const COMMANDS_WITHOUT_INDEX_PROPOSE = ['FT.CREATE']

export const COMPOSITE_ARGS = ['LOAD *']

export enum DefinedArgumentName {
  index = 'index',
  query = 'query',
  field = 'field',
  expression = 'expression',
}

export const FIELD_START_SYMBOL = '@'
export enum EmptySuggestionsIds {
  NoIndexes = 'no-indexes',
}

export const SORTED_SEARCH_COMMANDS = [
  'FT.SEARCH',
  'FT.AGGREGATE',
  'FT.CREATE',
  'FT.EXPLAIN',
  'FT.PROFILE',
]
