/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-this-in-sfc */
import cx from 'classnames'
import React, { Ref, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'
import {
  IconType,
  ColumnsIcon,
  EqualIcon,
  FoldersIcon,
  RiIcon,
} from 'uiBase/icons'
import { RiPopover, RiTooltip } from 'uiBase/display'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiIconButton, RiSecondaryButton, RiCheckbox } from 'uiBase/forms'
import KeysSummary from 'uiSrc/components/keys-summary'
import {
  SCAN_COUNT_DEFAULT,
  SCAN_TREE_COUNT_DEFAULT,
} from 'uiSrc/constants/api'
import {
  appContextDbConfig,
  resetBrowserTree,
  setBrowserKeyListDataLoaded,
  setBrowserSelectedKey,
  setBrowserShownColumns,
} from 'uiSrc/slices/app/context'

import {
  changeKeyViewType,
  fetchKeys,
  keysSelector,
  resetKeyInfo,
  resetKeysData,
} from 'uiSrc/slices/browser/keys'
import { redisearchSelector } from 'uiSrc/slices/browser/redisearch'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  KeysStoreData,
  KeyViewType,
  SearchMode,
} from 'uiSrc/slices/interfaces/keys'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'

import { OnboardingStepName, OnboardingSteps } from 'uiSrc/constants/onboarding'
import { incrementOnboardStepAction } from 'uiSrc/slices/app/features'
import { AutoRefresh, OnboardingTour } from 'uiSrc/components'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { BrowserColumns, KeyValueFormat } from 'uiSrc/constants'

import { setConnectivityError } from 'uiSrc/slices/app/connectivity'
import styles from './styles.module.scss'

const HIDE_REFRESH_LABEL_WIDTH = 640

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
  loading: boolean
  keysState: KeysStoreData
  nextCursor: string
  isSearched: boolean
  loadKeys: (type?: KeyViewType) => void
  handleScanMoreClick: (config: any) => void
}

const KeysHeader = (props: Props) => {
  const {
    loading,
    keysState,
    isSearched,
    loadKeys,
    handleScanMoreClick,
    nextCursor,
  } = props

  const { id: instanceId, keyNameFormat } = useSelector(
    connectedInstanceSelector,
  )
  const { viewType, searchMode, isFiltered } = useSelector(keysSelector)
  const { shownColumns } = useSelector(appContextDbConfig)
  const { selectedIndex } = useSelector(redisearchSelector)

  const [columnsConfigShown, setColumnsConfigShown] = useState(false)

  const rootDivRef: Ref<HTMLDivElement> = useRef(null)

  const dispatch = useDispatch()

  // TODO: Check if encoding can be reused from BE and FE
  const format = keyNameFormat as unknown as KeyValueFormat
  const isTreeViewDisabled =
    (format || KeyValueFormat.Unicode) === KeyValueFormat.HEX
  const viewTypes: ISwitchType<KeyViewType>[] = [
    {
      type: KeyViewType.Browser,
      tooltipText: 'List View',
      ariaLabel: 'List view button',
      dataTestId: 'view-type-browser-btn',
      isActiveView() {
        return viewType === this.type
      },
      getClassName() {
        return cx(styles.viewTypeBtn, { [styles.active]: this.isActiveView() })
      },
      getIconType() {
        return EqualIcon
      },
      onClick() {
        handleSwitchView(this.type)
      },
    },
    {
      type: KeyViewType.Tree,
      tooltipText: isTreeViewDisabled
        ? 'Tree View is unavailable when the HEX key name format is selected.'
        : 'Tree View',
      ariaLabel: 'Tree view button',
      dataTestId: 'view-type-list-btn',
      disabled: isTreeViewDisabled,
      isActiveView() {
        return viewType === this.type
      },
      getClassName() {
        return cx(styles.viewTypeBtn, { [styles.active]: this.isActiveView() })
      },
      getIconType() {
        return FoldersIcon
      },
      onClick() {
        handleSwitchView(this.type)
        dispatch(
          incrementOnboardStepAction(
            OnboardingSteps.BrowserTreeView,
            undefined,
            () =>
              sendEventTelemetry({
                event: TelemetryEvent.ONBOARDING_TOUR_ACTION_MADE,
                eventData: {
                  databaseId: instanceId,
                  step: OnboardingStepName.BrowserTreeView,
                },
              }),
          ),
        )
      },
    },
  ]

  const scanMoreStyle = {
    marginLeft: 10,
    height: '36px !important',
  }

  const toggleColumnsConfigVisibility = () =>
    setColumnsConfigShown(!columnsConfigShown)

  const handleRefreshKeys = () => {
    dispatch(
      fetchKeys(
        {
          searchMode,
          cursor: '0',
          count:
            viewType === KeyViewType.Browser
              ? SCAN_COUNT_DEFAULT
              : SCAN_TREE_COUNT_DEFAULT,
        },
        (data) => {
          const keys = Array.isArray(data) ? data[0].keys : data.keys

          if (!keys.length) {
            dispatch(resetKeyInfo())
            dispatch(setBrowserSelectedKey(null))
          }

          dispatch(setBrowserKeyListDataLoaded(searchMode, true))
          dispatch(setConnectivityError(null))
        },
        () => dispatch(setBrowserKeyListDataLoaded(searchMode, false)),
      ),
    )
  }

  const handleEnableAutoRefresh = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    const browserViewEvent = enableAutoRefresh
      ? TelemetryEvent.BROWSER_KEY_LIST_AUTO_REFRESH_ENABLED
      : TelemetryEvent.BROWSER_KEY_LIST_AUTO_REFRESH_DISABLED
    const treeViewEvent = enableAutoRefresh
      ? TelemetryEvent.TREE_VIEW_KEY_LIST_AUTO_REFRESH_ENABLED
      : TelemetryEvent.TREE_VIEW_KEY_LIST_AUTO_REFRESH_DISABLED
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(viewType, browserViewEvent, treeViewEvent),
      eventData: {
        databaseId: instanceId,
        refreshRate: +refreshRate,
      },
    })
  }

  const handleChangeAutoRefreshRate = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    if (enableAutoRefresh) {
      handleEnableAutoRefresh(enableAutoRefresh, refreshRate)
    }
  }

  const handleScanMore = (config: any) => {
    handleScanMoreClick?.({
      ...config,
      stopIndex:
        (viewType === KeyViewType.Browser
          ? SCAN_COUNT_DEFAULT
          : SCAN_TREE_COUNT_DEFAULT) - 1,
    })
  }

  const handleSwitchView = (type: KeyViewType) => {
    sendEventTelemetry({
      event:
        type === KeyViewType.Tree
          ? TelemetryEvent.TREE_VIEW_OPENED
          : TelemetryEvent.LIST_VIEW_OPENED,
      eventData: {
        databaseId: instanceId,
      },
    })

    dispatch(resetBrowserTree())
    dispatch(resetKeysData(searchMode))

    if (!(searchMode === SearchMode.Redisearch && !selectedIndex)) {
      loadKeys(type)
    }

    setTimeout(() => {
      dispatch(changeKeyViewType(type))
    }, 0)
  }

  const changeColumnsShown = (status: boolean, columnType: BrowserColumns) => {
    const shown = []
    const hidden = []
    const newColumns = status
      ? [...shownColumns, columnType]
      : shownColumns.filter((col) => col !== columnType)

    if (columnType === BrowserColumns.TTL) {
      status ? shown.push(BrowserColumns.TTL) : hidden.push(BrowserColumns.TTL)
    } else if (columnType === BrowserColumns.Size) {
      status
        ? shown.push(BrowserColumns.Size)
        : hidden.push(BrowserColumns.Size)
    }

    dispatch(setBrowserShownColumns(newColumns))
    sendEventTelemetry({
      event: TelemetryEvent.SHOW_BROWSER_COLUMN_CLICKED,
      eventData: {
        databaseId: instanceId,
        shown,
        hidden,
      },
    })
  }

  const ViewSwitch = () => (
    <div className={styles.viewTypeSwitch} data-testid="view-type-switcher">
      <OnboardingTour options={ONBOARDING_FEATURES.BROWSER_TREE_VIEW}>
        <>
          {viewTypes.map((view) => (
            <RiTooltip
              content={view.tooltipText}
              position="top"
              key={view.tooltipText}
            >
              <RiIconButton
                size="S"
                className={view.getClassName()}
                icon={view.getIconType()}
                aria-label={view.ariaLabel}
                onClick={() => view.onClick()}
                data-testid={view.dataTestId}
                disabled={view.disabled || false}
              />
            </RiTooltip>
          ))}
        </>
      </OnboardingTour>
    </div>
  )

  return (
    <div className={styles.content} ref={rootDivRef}>
      <AutoSizer disableHeight>
        {({ width }) => (
          <div style={{ width }}>
            <div className={styles.bottom}>
              <div className={styles.keysSummary}>
                <KeysSummary
                  items={keysState.keys}
                  totalItemsCount={keysState.total}
                  scanned={
                    isSearched ||
                    (isFiltered && searchMode === SearchMode.Pattern) ||
                    viewType === KeyViewType.Tree
                      ? keysState.scanned
                      : 0
                  }
                  loading={loading}
                  showScanMore={
                    !(
                      searchMode === SearchMode.Redisearch &&
                      keysState.maxResults &&
                      keysState.keys.length >= keysState.maxResults
                    )
                  }
                  scanMoreStyle={scanMoreStyle}
                  loadMoreItems={handleScanMore}
                  nextCursor={nextCursor}
                />
              </div>
              <div className={styles.keysControlsWrapper}>
                <AutoRefresh
                  disabled={
                    searchMode === SearchMode.Redisearch && !selectedIndex
                  }
                  disabledRefreshButtonMessage="Select an index to refresh keys."
                  iconSize="S"
                  postfix="keys"
                  loading={loading}
                  lastRefreshTime={keysState.lastRefreshTime}
                  displayText={(width || 0) > HIDE_REFRESH_LABEL_WIDTH}
                  containerClassName={styles.refreshContainer}
                  onRefresh={handleRefreshKeys}
                  onEnableAutoRefresh={handleEnableAutoRefresh}
                  onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
                  testid="keys"
                />
                <div className={styles.columnsButtonPopup}>
                  <RiPopover
                    ownFocus={false}
                    anchorPosition="downLeft"
                    isOpen={columnsConfigShown}
                    anchorClassName={styles.anchorWrapper}
                    panelClassName={styles.popoverWrapper}
                    closePopover={() => setColumnsConfigShown(false)}
                    button={
                      <RiSecondaryButton
                        size="small"
                        icon={ColumnsIcon}
                        onClick={toggleColumnsConfigVisibility}
                        className={styles.columnsButton}
                        data-testid="btn-columns-actions"
                        aria-label="columns"
                      >
                        <span className={styles.columnsButtonText}>
                          Columns
                        </span>
                      </RiSecondaryButton>
                    }
                  >
                    <RiRow align="center" gap="m">
                      <RiFlexItem grow>
                        <RiCheckbox
                          id="show-key-size"
                          name="show-key-size"
                          label="Key size"
                          checked={shownColumns.includes(BrowserColumns.Size)}
                          onChange={(e) =>
                            changeColumnsShown(
                              e.target.checked,
                              BrowserColumns.Size,
                            )
                          }
                          data-testid="show-key-size"
                          className={styles.checkbox}
                        />
                      </RiFlexItem>
                      <RiFlexItem grow>
                        <RiTooltip
                          content="Hide the key size to avoid performance issues when working with large keys."
                          position="top"
                          anchorClassName="flex-row"
                        >
                          <RiIcon
                            className={styles.infoIcon}
                            type="InfoIcon"
                            size="m"
                            style={{ cursor: 'pointer' }}
                            data-testid="key-size-info-icon"
                          />
                        </RiTooltip>
                      </RiFlexItem>
                    </RiRow>
                    <RiCheckbox
                      id="show-ttl"
                      name="show-ttl"
                      label="TTL"
                      checked={shownColumns.includes(BrowserColumns.TTL)}
                      onChange={(e) =>
                        changeColumnsShown(e.target.checked, BrowserColumns.TTL)
                      }
                      data-testid="show-ttl"
                    />
                  </RiPopover>
                </div>
                {ViewSwitch()}
              </div>
            </div>
          </div>
        )}
      </AutoSizer>
    </div>
  )
}

export default React.memo(KeysHeader)
