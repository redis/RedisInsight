import {
  GROUP_TYPES_COLORS,
  KeyTypes,
  ModulesKeyTypes,
  FeatureFlags,
} from 'uiSrc/constants'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import { isDevVectorSetEnabledSelector } from 'uiSrc/slices/app/features'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { FilterKeyTypeOption } from './FilterKeyType.types'

export const FILTER_KEY_TYPE_OPTIONS: FilterKeyTypeOption[] = [
  {
    text: 'Hash',
    value: KeyTypes.Hash,
    color: GROUP_TYPES_COLORS[KeyTypes.Hash],
  },
  {
    text: 'List',
    value: KeyTypes.List,
    color: GROUP_TYPES_COLORS[KeyTypes.List],
  },
  {
    text: 'Set',
    value: KeyTypes.Set,
    color: GROUP_TYPES_COLORS[KeyTypes.Set],
  },
  {
    text: 'Sorted Set',
    value: KeyTypes.ZSet,
    color: GROUP_TYPES_COLORS[KeyTypes.ZSet],
  },
  {
    text: 'String',
    value: KeyTypes.String,
    color: GROUP_TYPES_COLORS[KeyTypes.String],
  },
  {
    text: 'JSON',
    value: KeyTypes.ReJSON,
    color: GROUP_TYPES_COLORS[KeyTypes.ReJSON],
  },
  {
    text: 'Stream',
    value: KeyTypes.Stream,
    color: GROUP_TYPES_COLORS[KeyTypes.Stream],
  },
  {
    text: 'Vector Set',
    value: KeyTypes.VectorSet,
    color: GROUP_TYPES_COLORS[KeyTypes.VectorSet],
    minVersion: CommandsVersions.VECTOR_SET.since,
    isEnabledSelector: isDevVectorSetEnabledSelector,
  },
  {
    text: 'Graph',
    value: ModulesKeyTypes.Graph,
    color: GROUP_TYPES_COLORS[ModulesKeyTypes.Graph],
    skipIfNoModule: RedisDefaultModules.Graph,
    featureFlag: FeatureFlags.envDependent,
  },
  {
    text: 'Time Series',
    value: ModulesKeyTypes.TimeSeries,
    color: GROUP_TYPES_COLORS[ModulesKeyTypes.TimeSeries],
  },
]
