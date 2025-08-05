import React, { ReactNode } from 'react'
import { isArray, isUndefined, toNumber } from 'lodash'

import {
  formatBytes,
  Nullable,
  toBytes,
  truncateNumberToRange,
  truncatePercentage,
} from 'uiSrc/utils'
import { Theme } from 'uiSrc/constants'
import { numberWithSpaces } from 'uiSrc/utils/numbers'

import { AllIconsType } from 'uiSrc/components/base/icons'
import { RiLoader } from 'uiSrc/components/base/display'

import styles from './styles.module.scss'

interface Props {
  theme: string
  db?: number
  items: {
    version: string
    usedMemory?: Nullable<number>
    usedMemoryPercent?: Nullable<number>
    totalKeys?: Nullable<number>
    connectedClients?: Nullable<number>
    opsPerSecond?: Nullable<number>
    networkInKbps?: Nullable<number>
    networkOutKbps?: Nullable<number>
    cpuUsagePercentage?: Nullable<number>
    totalKeysPerDb?: Nullable<{ [key: string]: number }>
    cloudDetails?: {
      cloudId: number
      subscriptionId: number
      subscriptionType: 'fixed' | 'flexible'
      planMemoryLimit: number
      memoryLimitMeasurementUnit: string
    }
  }
}

export interface IMetric {
  id: string
  content: ReactNode
  value: any
  unavailableText?: string
  title: string
  tooltip?: {
    title?: string
    icon?: Nullable<AllIconsType>
    content: ReactNode | string
  }
  loading?: boolean
  groupId?: string
  icon?: Nullable<AllIconsType>
  className?: string
  children?: Array<IMetric>
}

function getCpuUsage(
  cpuUsagePercentage: number | null,
  theme: string,
): IMetric {
  return {
    id: 'overview-cpu',
    title: 'CPU',
    value: cpuUsagePercentage,
    loading: cpuUsagePercentage === null,
    unavailableText: 'CPU is not available',
    tooltip: {
      title: 'CPU',
      icon: theme === Theme.Dark ? 'TimeDarkIcon' : 'TimeLightIcon',
      content:
        cpuUsagePercentage === null ? (
          'Calculating in progress'
        ) : (
          <>
            <b>{truncatePercentage(cpuUsagePercentage, 4)}</b>
            &nbsp;%
          </>
        ),
    },
    className: styles.cpuWrapper,
    icon:
      cpuUsagePercentage !== null
        ? theme === Theme.Dark
          ? 'TimeDarkIcon'
          : 'TimeLightIcon'
        : null,
    content:
      cpuUsagePercentage === null ? (
        <>
          <div className={styles.calculationWrapper}>
            <RiLoader className={styles.spinner} size="m" />
            <span className={styles.calculation}>Calculating...</span>
          </div>
        </>
      ) : (
        `${truncatePercentage(cpuUsagePercentage, 2)} %`
      ),
  }
}

function getOpsPerSecondItem(
  theme: string,
  opsPerSecond: number,
  networkInKbps: number,
  networkOutKbps: number,
) {
  // Ops per second with tooltip
  const opsPerSecItem: any = {
    id: 'overview-commands-sec',
    icon: theme === Theme.Dark ? 'MeasureDarkIcon' : 'MeasureLightIcon',
    content: opsPerSecond,
    value: opsPerSecond,
    unavailableText: 'Commands/s are not available',
    title: 'Commands/s',
    tooltip: {
      icon: theme === Theme.Dark ? 'MeasureDarkIcon' : 'MeasureLightIcon',
      content: opsPerSecond,
    },
    className: styles.opsPerSecItem,
  }

  // let [networkIn, networkInUnit] = formatBytes(
  const networkInBytes = formatBytes((networkInKbps ?? 0) * 1000, 3, true, 1000)
  const networkIn = networkInBytes[0]
  const networkInUnit = networkInBytes[1]
    ? `${networkInBytes[1].toString().toLowerCase()}/s`
    : ''
  // let [networkOut, networkOutUnit] = formatBytes(
  const networkOutBytes = formatBytes(
    (networkOutKbps ?? 0) * 1000,
    3,
    true,
    1000,
  )
  const networkOutUnit = networkOutBytes[1]
    ? `${networkOutBytes[1].toString().toLowerCase()}/s`
    : ''
  const networkOut = networkOutBytes[0]

  const networkInItem = {
    id: 'network-input',
    groupId: opsPerSecItem.id,
    title: 'Network Input',
    icon: theme === Theme.Dark ? 'InputDarkIcon' : 'InputLightIcon',
    value: networkIn,
    content: (
      <>
        <b>{networkIn}</b>
        &nbsp;{networkInUnit}
      </>
    ),
    unavailableText: 'Network Input is not available',
    tooltip: {
      title: 'Network Input',
      icon: theme === Theme.Dark ? 'InputDarkIcon' : 'InputLightIcon',
      content: (
        <>
          <b>{networkIn}</b>
          &nbsp;{networkInUnit}
        </>
      ),
    },
  }

  const networkOutItem = {
    id: 'network-output-tip',
    groupId: opsPerSecItem.id,
    title: 'Network Output',
    icon: theme === Theme.Dark ? 'OutputDarkIcon' : 'OutputLightIcon',
    value: networkOut,
    content: (
      <>
        <b>{networkOut}</b>
        &nbsp;{networkOutUnit}
      </>
    ),
    unavailableText: 'Network Output is not available',
    tooltip: {
      title: 'Network Output',
      icon: theme === Theme.Dark ? 'OutputDarkIcon' : 'OutputLightIcon',
      content: (
        <>
          <b>{networkOut}</b>
          &nbsp;{networkOutUnit}
        </>
      ),
    },
  }

  if (!isUndefined(opsPerSecond)) {
    opsPerSecItem.children = [
      {
        id: 'commands-per-sec-tip',
        title: 'Commands/s',
        icon: theme === Theme.Dark ? 'MeasureDarkIcon' : 'MeasureLightIcon',
        value: opsPerSecond,
        content: opsPerSecond,
        unavailableText: 'Commands/s are not available',
      },
      networkInItem,
      networkOutItem,
    ]
  }
  return opsPerSecItem
}

function getUsedMemoryItem(
  theme: string,
  usedMemory: number,
  planMemoryLimit: number,
  usedMemoryPercent: number,
  memoryLimitMeasurementUnit = 'MB',
): IMetric {
  const memoryUsed = formatBytes(usedMemory, 0)
  const planMemory = planMemoryLimit
    ? formatBytes(toBytes(planMemoryLimit, memoryLimitMeasurementUnit) || 0, 1)
    : ''

  const memoryContent = planMemoryLimit ? (
    <span>
      {memoryUsed} / <strong>{planMemory}</strong> ({usedMemoryPercent}%)
    </span>
  ) : (
    memoryUsed
  )
  const memoryUsedTooltip = planMemory
    ? ` / ${planMemory} (${usedMemoryPercent}%)`
    : ''

  const formattedUsedMemoryTooltip = formatBytes(usedMemory || 0, 3, true)
  return {
    id: 'overview-total-memory',
    value: usedMemory,
    unavailableText: 'Total Memory is not available',
    title: 'Total Memory',
    tooltip: {
      title: 'Total Memory',
      icon: theme === Theme.Dark ? 'MemoryDarkIcon' : 'MemoryLightIcon',
      content: isArray(formattedUsedMemoryTooltip) ? (
        <>
          <b>{formattedUsedMemoryTooltip[0]}</b>
          &nbsp;
          {formattedUsedMemoryTooltip[1]}
          {memoryUsedTooltip}
        </>
      ) : (
        `${formattedUsedMemoryTooltip}${memoryUsedTooltip}`
      ),
    },
    icon: theme === Theme.Dark ? 'MemoryDarkIcon' : 'MemoryLightIcon',
    content: memoryContent,
  }
}

function getTotalKeysItem(
  theme: string,
  totalKeys = 0,
  db = 0,
  dbKeysCount?: number,
) {
  const totalKeysItem: any = {
    id: 'overview-total-keys',
    value: totalKeys,
    unavailableText: 'Total Keys are not available',
    title: 'Total Keys',
    tooltip: {
      title: 'Total Keys',
      content: <b>{numberWithSpaces(totalKeys)}</b>,
      icon: theme === Theme.Dark ? 'KeyDarkIcon' : 'KeyLightIcon',
    },
    icon: theme === Theme.Dark ? 'KeyDarkIcon' : 'KeyLightIcon',
    content: truncateNumberToRange(totalKeys),
  }

  // keys in the logical database
  if (!isUndefined(dbKeysCount) && dbKeysCount < toNumber(totalKeys)) {
    totalKeysItem.children = [
      {
        id: 'total-keys-tip',
        value: totalKeys,
        unavailableText: 'Total Keys are not available',
        title: 'Total Keys',
        tooltip: {
          title: 'Total Keys',
          content: <b>{numberWithSpaces(totalKeys)}</b>,
        },
        content: <b>{numberWithSpaces(totalKeys)}</b>,
      },
      {
        id: 'overview-db-total-keys',
        title: 'Keys',
        value: dbKeysCount,
        content: (
          <>
            <span
              style={{
                fontWeight: 200,
                paddingRight: 1,
              }}
            >
              db{db || 0}:
            </span>
            <b>{numberWithSpaces(dbKeysCount || 0)}</b>
          </>
        ),
      },
    ]
  }
  return totalKeysItem
}

const getConnectedClient = (connectedClients: number = 0) =>
  Number.isInteger(connectedClients)
    ? connectedClients
    : `~${Math.round(connectedClients)}`

function getConnectedClientItem(theme: string, connectedClients = 0): IMetric {
  const connectedClientsCount = getConnectedClient(connectedClients)
  const icon = theme === Theme.Dark ? 'UserDarkIcon' : 'UserLightIcon'
  return {
    id: 'overview-connected-clients',
    value: connectedClients,
    unavailableText: 'Connected Clients are not available',
    title: 'Connected Clients',
    tooltip: {
      title: 'Connected Clients',
      content: <b>{connectedClientsCount}</b>,
      icon,
    },
    icon,
    content: connectedClientsCount,
  }
}

export const getOverviewMetrics = ({
  theme,
  items,
  db = 0,
}: Props): Array<IMetric> => {
  const {
    usedMemory,
    usedMemoryPercent,
    totalKeys,
    connectedClients,
    cpuUsagePercentage,
    opsPerSecond,
    networkInKbps,
    networkOutKbps,
    totalKeysPerDb = {},
    cloudDetails,
  } = items

  const availableItems: Array<IMetric> = []

  // CPU
  if (!isUndefined(cpuUsagePercentage)) {
    availableItems.push(getCpuUsage(cpuUsagePercentage, theme))
  }

  if (!isUndefined(opsPerSecond)) {
    availableItems.push(
      getOpsPerSecondItem(
        theme,
        opsPerSecond ?? 0,
        networkInKbps ?? 0,
        networkOutKbps ?? 0,
      ),
    )
  }

  // Used memory
  if (!isUndefined(usedMemory)) {
    availableItems.push(
      getUsedMemoryItem(
        theme,
        usedMemory ?? 0,
        cloudDetails?.planMemoryLimit ?? 0,
        usedMemoryPercent ?? 0,
        cloudDetails?.memoryLimitMeasurementUnit,
      ),
    )
  }

  // Total keys
  const totalKeysItem = getTotalKeysItem(
    theme,
    totalKeys ?? 0,
    db,
    totalKeysPerDb?.[`db${db || 0}`],
  )

  if (!isUndefined(totalKeys)) {
    availableItems.push(totalKeysItem)
  }

  // Connected clients
  if (!isUndefined(connectedClients)) {
    availableItems.push(getConnectedClientItem(theme, connectedClients ?? 0))
  }

  return availableItems
}
