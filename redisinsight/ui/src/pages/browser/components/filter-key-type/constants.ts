import {
  GROUP_TYPES_COLORS,
  KeyTypes,
  ModulesKeyTypes,
  FeatureFlags,
} from 'uiSrc/constants'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import {
  isArrayEnabledSelector,
  isVectorSetEnabledSelector,
} from 'uiSrc/slices/app/features'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { FilterKeyTypeOption } from './FilterKeyType.types'

export const FILTER_KEY_TYPE_OPTIONS: FilterKeyTypeOption[] = [
  {
    text: 'common.keyType.hash',
    value: KeyTypes.Hash,
    color: GROUP_TYPES_COLORS[KeyTypes.Hash],
  },
  {
    text: 'common.keyType.list',
    value: KeyTypes.List,
    color: GROUP_TYPES_COLORS[KeyTypes.List],
  },
  {
    text: 'common.keyType.array',
    value: KeyTypes.Array,
    color: GROUP_TYPES_COLORS[KeyTypes.Array],
    minVersion: CommandsVersions.ARRAY.since,
    isEnabledSelector: isArrayEnabledSelector,
  },
  {
    text: 'common.keyType.set',
    value: KeyTypes.Set,
    color: GROUP_TYPES_COLORS[KeyTypes.Set],
  },
  {
    text: 'common.keyType.sortedSet',
    value: KeyTypes.ZSet,
    color: GROUP_TYPES_COLORS[KeyTypes.ZSet],
  },
  {
    text: 'common.keyType.string',
    value: KeyTypes.String,
    color: GROUP_TYPES_COLORS[KeyTypes.String],
  },
  {
    text: 'common.keyType.json',
    value: KeyTypes.ReJSON,
    color: GROUP_TYPES_COLORS[KeyTypes.ReJSON],
  },
  {
    text: 'common.keyType.stream',
    value: KeyTypes.Stream,
    color: GROUP_TYPES_COLORS[KeyTypes.Stream],
  },
  {
    text: 'common.keyType.vectorSet',
    value: KeyTypes.VectorSet,
    color: GROUP_TYPES_COLORS[KeyTypes.VectorSet],
    minVersion: CommandsVersions.VECTOR_SET.since,
    isEnabledSelector: isVectorSetEnabledSelector,
  },
  {
    text: 'common.keyType.graph',
    value: ModulesKeyTypes.Graph,
    color: GROUP_TYPES_COLORS[ModulesKeyTypes.Graph],
    skipIfNoModule: RedisDefaultModules.Graph,
    featureFlag: FeatureFlags.envDependent,
  },
  {
    text: 'common.keyType.timeSeries',
    value: ModulesKeyTypes.TimeSeries,
    color: GROUP_TYPES_COLORS[ModulesKeyTypes.TimeSeries],
  },
]
