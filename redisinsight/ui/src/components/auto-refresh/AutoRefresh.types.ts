import { Nullable } from 'uiSrc/utils'

export interface AutoRefreshProps {
  postfix: string
  loading: boolean
  displayText?: boolean
  displayLastRefresh?: boolean
  lastRefreshTime: Nullable<number>
  testid?: string
  containerClassName?: string
  turnOffAutoRefresh?: boolean
  onRefresh: (forceRefresh?: boolean) => void
  onRefreshClicked?: () => void
  onEnableAutoRefresh?: (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => void
  onChangeAutoRefreshRate?: (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => void
  minimumRefreshRate?: number
  defaultRefreshRate?: string
  iconSize?: 'S' | 'M' | 'L'
  disabled?: boolean
  disabledRefreshButtonMessage?: string
  enableAutoRefreshDefault?: boolean
}
