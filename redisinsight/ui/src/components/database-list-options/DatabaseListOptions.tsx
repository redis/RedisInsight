import React from 'react'
import { isString } from 'lodash'

import { RiTooltip } from 'uiSrc/components'

import {
  AddRedisClusterDatabaseOptions,
  DATABASE_LIST_OPTIONS_TEXT,
  PersistencePolicy,
} from 'uiSrc/slices/interfaces'

import { ActiveActiveIcon, RedisonFlashIcon } from 'uiSrc/components/base/icons'
import { IconButton, IconType } from 'uiSrc/components/base/forms/buttons'
import { handleCopy } from 'uiSrc/utils'
import {
  DatabaseListOptionsContainer,
  OptionsIcon,
  ValidOptionIndex,
} from './DatabaseListOptions.styles'

interface Props {
  options: Partial<any>
}

interface ITooltipProps {
  content: string
  index: number
  value: any
  icon?: IconType
}

const Tooltip = ({
  content: contentProp,
  icon,
  value,
  index,
}: ITooltipProps) =>
  contentProp ? (
    <RiTooltip
      content={
        isString(value)
          ? `Persistence: ${PersistencePolicy[value as keyof typeof PersistencePolicy]}`
          : contentProp
      }
      position="top"
    >
      {icon ? (
        <IconButton
          icon={icon}
          onClick={() => handleCopy(contentProp)}
          aria-label={`${contentProp}_module`}
        />
      ) : (
        <OptionsIcon
          $icon={index as ValidOptionIndex}
          aria-label={contentProp}
          onClick={() => handleCopy(contentProp)}
          onKeyDown={() => ({})}
          role="presentation"
        >
          {contentProp.match(/\b(\w)/g)?.join('')}
        </OptionsIcon>
      )}
    </RiTooltip>
  ) : null

type OptionContent = {
  icon?: IconType
  text: string
}

type OptionKey = AddRedisClusterDatabaseOptions

type OptionsContent = Record<OptionKey, OptionContent>

const OPTIONS_CONTENT: OptionsContent = {
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

const DatabaseListOptions = ({ options }: Props) => {
  const optionsRender = Object.entries(options)
    ?.sort(([option]) => {
      if (OPTIONS_CONTENT[option as OptionKey]?.icon === undefined) {
        return -1
      }
      return 0
    })
    ?.map(([option, value]: any, index: number) => {
      if (value && value !== PersistencePolicy.none) {
        return (
          <Tooltip
            key={`${option + index}`}
            icon={OPTIONS_CONTENT[option as OptionKey]?.icon}
            content={OPTIONS_CONTENT[option as OptionKey]?.text}
            value={value}
            index={index}
          />
        )
      }
      return null
    })

  return (
    <DatabaseListOptionsContainer>{optionsRender}</DatabaseListOptionsContainer>
  )
}

export default DatabaseListOptions
