import { GROUP_TYPES_COLORS, KeyTypes } from 'uiSrc/constants'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import { isDevVectorSetEnabledSelector } from 'uiSrc/slices/app/features'
import { AddKeyTypeOption } from '../AddKey.types'

export const ADD_KEY_TYPE_OPTIONS: AddKeyTypeOption[] = [
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
]
