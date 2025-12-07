import {
  AddRedisClusterDatabaseOptions,
  DATABASE_LIST_OPTIONS_TEXT,
} from 'uiSrc/slices/interfaces'
import { ActiveActiveIcon, RedisonFlashIcon } from 'uiSrc/components/base/icons'
import { IconType } from 'uiSrc/components/base/forms/buttons'

export type OptionKey = AddRedisClusterDatabaseOptions

type OptionsContent = Record<OptionKey, OptionContent>

type OptionContent = {
  icon?: IconType
  text: string
}

export const OPTIONS_CONTENT: OptionsContent = {
  [AddRedisClusterDatabaseOptions.ActiveActive]: {
    icon: ActiveActiveIcon,
    text: DATABASE_LIST_OPTIONS_TEXT[
      AddRedisClusterDatabaseOptions.ActiveActive
    ],
  },
  [AddRedisClusterDatabaseOptions.Backup]: {
    text: DATABASE_LIST_OPTIONS_TEXT[AddRedisClusterDatabaseOptions.Backup],
  },

  [AddRedisClusterDatabaseOptions.Clustering]: {
    text: DATABASE_LIST_OPTIONS_TEXT[AddRedisClusterDatabaseOptions.Clustering],
  },
  [AddRedisClusterDatabaseOptions.PersistencePolicy]: {
    text: DATABASE_LIST_OPTIONS_TEXT[
      AddRedisClusterDatabaseOptions.PersistencePolicy
    ],
  },
  [AddRedisClusterDatabaseOptions.Flash]: {
    icon: RedisonFlashIcon,
    text: DATABASE_LIST_OPTIONS_TEXT[AddRedisClusterDatabaseOptions.Flash],
  },
  [AddRedisClusterDatabaseOptions.Replication]: {
    text: DATABASE_LIST_OPTIONS_TEXT[
      AddRedisClusterDatabaseOptions.Replication
    ],
  },
  [AddRedisClusterDatabaseOptions.ReplicaDestination]: {
    text: DATABASE_LIST_OPTIONS_TEXT[
      AddRedisClusterDatabaseOptions.ReplicaDestination
    ],
  },
  [AddRedisClusterDatabaseOptions.ReplicaSource]: {
    text: DATABASE_LIST_OPTIONS_TEXT[
      AddRedisClusterDatabaseOptions.ReplicaSource
    ],
  },
}
