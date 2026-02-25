import { CSSProperties, ReactNode } from 'react'

import { Nullable } from 'uiSrc/utils'

import { AllIconsType } from 'uiSrc/components/base/icons/RiIcon'

export interface GetOverviewMetricsInterface {
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
    maxCpuUsagePercentage?: Nullable<number>
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

export interface OverviewItemProps {
  children: ReactNode
  className?: string
  id?: string
  style?: CSSProperties
}
