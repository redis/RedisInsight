/* eslint-disable react/no-this-in-sfc */
/* eslint-disable react/destructuring-assignment */
import React, { useCallback, useState } from 'react'

import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import {
  FilterTableIcon,
  IconType,
  QuerySearchIcon,
} from 'uiSrc/components/base/icons'
import { ModuleNotLoaded, OnboardingTour, RiTooltip } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import FilterKeyType from 'uiSrc/pages/browser/components/filter-key-type'
import RediSearchIndexesList from 'uiSrc/pages/browser/components/redisearch-key-list'
import SearchKeyList from 'uiSrc/pages/browser/components/search-key-list'

import { changeSearchMode, keysSelector } from 'uiSrc/slices/browser/keys'
import { isRedisearchAvailable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { resetBrowserTree } from 'uiSrc/slices/app/context'
import { localStorageService } from 'uiSrc/services'
import { BrowserStorageItem } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'

import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { Modal } from 'uiSrc/components/base/display'
import styles from './styles.module.scss'

interface ISwitchType<T> {
  tooltipText: string
  type: T
  disabled?: boolean
  ariaLabel: string
  dataTestId: string
  getClassName: () => string
  onClick: () => void
  isActiveView: () => boolean
  getIconType: () => IconType
}

export interface Props {
  handleCreateIndexPanel: (value: boolean) => void
}

const BrowserSearchPanel = (props: Props) => {
  const { handleCreateIndexPanel } = props
  const { viewType, searchMode } = useSelector(keysSelector)
  const { id: instanceId, modules } = useSelector(connectedInstanceSelector)

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const dispatch = useDispatch()

  const searchModes: ISwitchType<SearchMode>[] = [
    {
      type: SearchMode.Pattern,
      tooltipText: 'Filter by Key Name or Pattern',
      ariaLabel: 'Filter by Key Name or Pattern button',
      dataTestId: 'search-mode-pattern-btn',
      isActiveView() {
        return searchMode === this.type
      },
      getClassName() {
        return cx(styles.viewTypeBtn, styles.iconVector, {
          [styles.active]: this.isActiveView?.(),
        })
      },
      getIconType() {
        return FilterTableIcon
      },
      onClick() {
        handleSwitchSearchMode(this.type)
      },
    },
    {
      type: SearchMode.Redisearch,
      tooltipText: 'Search by Values of Keys',
      ariaLabel: 'Search by Values of Keys button',
      dataTestId: 'search-mode-redisearch-btn',
      disabled: !isRedisearchAvailable(modules),
      isActiveView() {
        return searchMode === this.type
      },
      getClassName() {
        return cx(styles.viewTypeBtn, {
          [styles.active]: this.isActiveView?.(),
        })
      },
      getIconType() {
        return QuerySearchIcon
      },
      onClick() {
        if (this.disabled) {
          showPopover()
          sendEventTelemetry({
            event: TelemetryEvent.SEARCH_MODE_CHANGE_FAILED,
            eventData: {
              databaseId: instanceId,
              view: viewType,
            },
          })
        } else {
          handleSwitchSearchMode(this.type)
        }
      },
    },
  ]

  const handleSwitchSearchMode = (mode: SearchMode) => {
    if (searchMode !== mode) {
      sendEventTelemetry({
        event: TelemetryEvent.SEARCH_MODE_CHANGED,
        eventData: {
          databaseId: instanceId,
          previous: searchMode,
          current: mode,
          view: viewType,
        },
      })
    }

    dispatch(changeSearchMode(mode))

    if (viewType === KeyViewType.Tree) {
      dispatch(resetBrowserTree())
    }

    localStorageService.set(BrowserStorageItem.browserSearchMode, mode)
  }

  const hidePopover = useCallback(() => {
    setIsPopoverOpen(false)
  }, [])

  const showPopover = useCallback(() => {
    setIsPopoverOpen(true)
  }, [])

  const SwitchModeBtn = (item: ISwitchType<SearchMode>) => (
    <IconButton
      className={item.getClassName()}
      icon={item.getIconType()}
      aria-label={item.ariaLabel}
      onClick={() => item.onClick?.()}
      data-testid={item.dataTestId}
    />
  )

  const SearchModeSwitch = () => (
    <div
      className={cx(styles.searchModeSwitch)}
      data-testid="search-mode-switcher"
    >
      {searchModes.map((mode) => (
        <RiTooltip
          content={mode.tooltipText}
          position="bottom"
          key={mode.tooltipText}
        >
          {SwitchModeBtn(mode)}
        </RiTooltip>
      ))}
    </div>
  )

  return (
    <div className={styles.content}>
      <Modal
        open={isPopoverOpen}
        onCancel={hidePopover}
        className={styles.moduleNotLoaded}
        content={
          <ModuleNotLoaded
            moduleName={RedisDefaultModules.Search}
            type="browser"
            id="0"
            onClose={hidePopover}
          />
        }
        title=""
      />
      <div className={styles.searchWrapper}>
        <OnboardingTour
          options={ONBOARDING_FEATURES.BROWSER_FILTER_SEARCH}
          anchorPosition="downLeft"
          panelClassName={styles.browserFilterOnboard}
        >
          {SearchModeSwitch()}
        </OnboardingTour>
        {searchMode === SearchMode.Pattern ? (
          <FilterKeyType modules={modules} />
        ) : (
          <RediSearchIndexesList onCreateIndex={handleCreateIndexPanel} />
        )}
        <SearchKeyList />
      </div>
    </div>
  )
}

export default BrowserSearchPanel
