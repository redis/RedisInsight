/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/no-this-in-sfc */
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'
import { IconType, EqualIcon, FoldersIcon } from 'uiSrc/components/base/icons'
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
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { ONBOARDING_FEATURES } from 'uiSrc/components/onboarding-features'
import { BrowserColumns, KeyValueFormat } from 'uiSrc/constants'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { setConnectivityError } from 'uiSrc/slices/app/connectivity'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'
import { ToggleButton } from 'uiSrc/components/base/forms/buttons'
import { ColorText } from 'uiSrc/components/base/text'

import * as S from './KeysHeader.styles'

const HIDE_REFRESH_LABEL_WIDTH = 640

interface ISwitchType<T> {
  tooltipText: string
  type: T
  disabled?: boolean
  ariaLabel: string
  dataTestId: string
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

  const dispatch = useDispatch()
  const handleSwitchView = (type: KeyViewType) => {
    void sendEventTelemetry({
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
    <OnboardingTour options={ONBOARDING_FEATURES.BROWSER_TREE_VIEW}>
      <ButtonGroup data-testid="view-type-switcher">
        {viewTypes.map((view) => (
          <RiTooltip
            content={view.tooltipText}
            position="top"
            key={view.tooltipText}
          >
            <S.ViewSwitchButton
              aria-label={view.ariaLabel}
              onClick={() => view.onClick()}
              isSelected={view.isActiveView()}
              data-testid={view.dataTestId}
              disabled={view.disabled || false}
            >
              <ButtonGroup.Icon icon={view.getIconType()} />
            </S.ViewSwitchButton>
          </RiTooltip>
        ))}
      </ButtonGroup>
    </OnboardingTour>
  )

  return (
    <S.Content>
      <AutoSizer disableHeight>
        {({ width }) => (
          <Row justify="between" style={{ width }}>
            <FlexItem>
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
            </FlexItem>
            <FlexItem>
              <Row gap="l">
                <FlexItem>
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
                    onRefresh={handleRefreshKeys}
                    onEnableAutoRefresh={handleEnableAutoRefresh}
                    onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
                    testid="keys"
                  />
                </FlexItem>
                <FlexItem>
                  <RiPopover
                    ownFocus={false}
                    anchorPosition="downLeft"
                    isOpen={columnsConfigShown}
                    closePopover={() => setColumnsConfigShown(false)}
                    button={
                      <S.ColumnsButton>
                        <ToggleButton
                          onPressedChange={toggleColumnsConfigVisibility}
                          data-testid="btn-columns-actions"
                          aria-label="columns"
                          pressed={columnsConfigShown}
                        >
                          <RiIcon size="m" type="ColumnsIcon" />
                          <ColorText size="s">Columns</ColorText>
                        </ToggleButton>
                      </S.ColumnsButton>
                    }
                  >
                    <Col gap="m">
                      <FlexItem>
                        <Row align="center" gap="m">
                          <FlexItem grow>
                            <Checkbox
                              id="show-key-size"
                              name="show-key-size"
                              label="Key size"
                              checked={shownColumns.includes(
                                BrowserColumns.Size,
                              )}
                              onChange={(e) =>
                                changeColumnsShown(
                                  e.target.checked,
                                  BrowserColumns.Size,
                                )
                              }
                              data-testid="show-key-size"
                            />
                          </FlexItem>
                          <FlexItem>
                            <RiTooltip
                              content="Hide the key size to avoid performance issues when working with large keys."
                              position="top"
                              anchorClassName="flex-row"
                            >
                              <RiIcon
                                type="InfoIcon"
                                size="m"
                                style={{ cursor: 'pointer' }}
                                data-testid="key-size-info-icon"
                              />
                            </RiTooltip>
                          </FlexItem>
                        </Row>
                      </FlexItem>
                      <FlexItem>
                        <Checkbox
                          id="show-ttl"
                          name="show-ttl"
                          label="TTL"
                          checked={shownColumns.includes(BrowserColumns.TTL)}
                          onChange={(e) =>
                            changeColumnsShown(
                              e.target.checked,
                              BrowserColumns.TTL,
                            )
                          }
                          data-testid="show-ttl"
                        />
                      </FlexItem>
                    </Col>
                  </RiPopover>
                </FlexItem>
                <FlexItem>{ViewSwitch()}</FlexItem>
              </Row>
            </FlexItem>
          </Row>
        )}
      </AutoSizer>
    </S.Content>
  )
}

export default React.memo(KeysHeader)
