import React from 'react'

import { AutoRefresh } from 'uiSrc/components'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils'

export interface PaneAutoRefreshProps {
  postfix: string
  loading: boolean
  lastRefreshTime: Nullable<number>
  onRefresh: () => void
  testid: string
  disabled?: boolean
  disabledRefreshButtonMessage?: string
}

/**
 * Pane-header flavor of the shared AutoRefresh: compact icon, and the
 * user's enablement persisted per pane so it survives tab switches.
 */
const PaneAutoRefresh = ({ postfix, ...props }: PaneAutoRefreshProps) => (
  <AutoRefresh
    postfix={postfix}
    iconSize="S"
    enableAutoRefreshDefault={
      localStorageService.get(
        BrowserStorageItem.autoRefreshEnabled + postfix,
      ) === true
    }
    onEnableAutoRefresh={(enableAutoRefresh) =>
      localStorageService.set(
        BrowserStorageItem.autoRefreshEnabled + postfix,
        enableAutoRefresh,
      )
    }
    {...props}
  />
)

export default PaneAutoRefresh
