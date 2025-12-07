import { ReactNode } from 'react'

export enum TableView {
  MEMORY = 'memory',
  KEYS = 'keys',
}

export enum EmptyMessage {
  Reports = 'reports',
  Keys = 'keys',
  Encrypt = 'encrypt',
}

export type Content = {
  title: string
  text: (path: string) => ReactNode
}

export const DEFAULT_EXTRAPOLATION = 1

export enum SectionName {
  SUMMARY_PER_DATA = 'SUMMARY_PER_DATA',
  MEMORY_LIKELY_TO_BE_FREED = 'MEMORY_LIKELY_TO_BE_FREED',
  TOP_NAMESPACES = 'TOP_NAMESPACES',
}
