import React, { useContext } from 'react'
import { isString } from 'lodash'
import { IconType } from '@elastic/eui'
import { RiTooltip } from 'uiSrc/components'

import {
  AddRedisClusterDatabaseOptions,
  DATABASE_LIST_OPTIONS_TEXT,
  PersistencePolicy,
} from 'uiSrc/slices/interfaces'

import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import {
  ActiveActiveDarkIcon,
  ActiveActiveLightIcon,
  RedisOnFlashDarkIcon,
  RedisOnFlashLightIcon,
} from 'uiSrc/components/base/icons'
import { RiIconButton } from 'uiSrc/components/base/forms'
import styles from './styles.module.scss'

interface Props {
  options: Partial<any>
}

interface ITooltipProps {
  content: string
  index: number
  value: any
  icon: IconType
}

const DatabaseListOptions = ({ options }: Props) => {
  const { theme } = useContext(ThemeContext)

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  const OPTIONS_CONTENT = {
    [AddRedisClusterDatabaseOptions.ActiveActive]: {
      icon: theme === Theme.Dark ? ActiveActiveDarkIcon : ActiveActiveLightIcon,
      text: DATABASE_LIST_OPTIONS_TEXT[
        AddRedisClusterDatabaseOptions.ActiveActive
      ],
    },
    [AddRedisClusterDatabaseOptions.Backup]: {
      text: DATABASE_LIST_OPTIONS_TEXT[AddRedisClusterDatabaseOptions.Backup],
    },

    [AddRedisClusterDatabaseOptions.Clustering]: {
      text: DATABASE_LIST_OPTIONS_TEXT[
        AddRedisClusterDatabaseOptions.Clustering
      ],
    },
    [AddRedisClusterDatabaseOptions.PersistencePolicy]: {
      text: DATABASE_LIST_OPTIONS_TEXT[
        AddRedisClusterDatabaseOptions.PersistencePolicy
      ],
    },
    [AddRedisClusterDatabaseOptions.Flash]: {
      icon: theme === Theme.Dark ? RedisOnFlashDarkIcon : RedisOnFlashLightIcon,
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

  const Tooltip = ({
    content: contentProp,
    icon,
    index,
    value,
  }: ITooltipProps) => (
    <>
      {contentProp ? (
        <RiTooltip
          content={
            isString(value)
              ? `Persistence: ${PersistencePolicy[value]}`
              : contentProp
          }
          position="top"
          anchorClassName={styles.tooltip}
        >
          {icon ? (
            <RiIconButton
              icon={icon}
              onClick={() => handleCopy(contentProp)}
              aria-labelledby={`${contentProp}_module`}
            />
          ) : (
            <div
              className={['options_icon', `option_icon_${index}`].join(' ')}
              aria-labelledby={contentProp}
              onClick={() => handleCopy(contentProp)}
              onKeyDown={() => ({})}
              role="presentation"
            >
              {contentProp.match(/\b(\w)/g)?.join('')}
            </div>
          )}
        </RiTooltip>
      ) : null}
    </>
  )

  const optionsRender = Object.entries(options)
    ?.sort(([option]) => {
      if (OPTIONS_CONTENT[option]?.icon === undefined) {
        return -1
      }
      return 0
    })
    ?.map(([option, value]: any, index: number) => {
      if (value && value !== PersistencePolicy.none) {
        return (
          <Tooltip
            key={`${option + index}`}
            icon={OPTIONS_CONTENT[option]?.icon}
            content={OPTIONS_CONTENT[option]?.text}
            value={value}
            index={index}
          />
        )
      }
      return null
    })

  return <div className={styles.options}>{optionsRender}</div>
}

export default DatabaseListOptions
