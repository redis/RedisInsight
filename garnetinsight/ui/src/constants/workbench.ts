import { ResultsMode, RunQueryMode } from 'uiSrc/slices/interfaces'

export const CodeButtonResults = {
  group: ResultsMode.GroupMode,
  single: ResultsMode.Default,
  silent: ResultsMode.Silent,
  [ResultsMode.GroupMode]: ResultsMode.GroupMode,
  [ResultsMode.Default]: ResultsMode.Default,
  [ResultsMode.Silent]: ResultsMode.Silent,
}

export const CodeButtonRunQueryMode = {
  raw: RunQueryMode.Raw,
  ascii: RunQueryMode.ASCII,
  [RunQueryMode.Raw]: RunQueryMode.Raw,
  [RunQueryMode.ASCII]: RunQueryMode.ASCII,
}

export const BooleanParams = {
  true: 'true',
  false: 'false',
}

export enum EAItemActions {
  Create = 'create',
  Delete = 'delete',
}

export enum EAManifestFirstKey {
  CUSTOM_TUTORIALS = 'custom-tutorials',
  TUTORIALS = 'tutorials',
  GUIDES = 'quick-guides',
}

export interface CodeButtonParams {
  clearEditor?: boolean
  pipeline?: string
  results?: keyof typeof CodeButtonResults
  mode?: keyof typeof CodeButtonRunQueryMode
  run_confirmation?: keyof typeof BooleanParams
  executable?: keyof typeof BooleanParams
}

export enum ExecuteButtonMode {
  Auto = 'auto',
  Manual = 'manual',
}
