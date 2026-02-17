import React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'

import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import { AutoRefresh } from 'uiSrc/components'
import { PlusIcon } from 'uiSrc/components/base/icons'
import { ActionIconButton } from 'uiSrc/components/base/forms/buttons'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'

import { ViewSwitch, ColumnsMenu } from 'uiSrc/components/browser'

import { KeyTreeSettings } from '../../key-tree'
import { useKeysBrowserPanel } from '../contexts/Context'

const HIDE_REFRESH_LABEL_WIDTH = 640

const Header = () => {
  const {
    viewType,
    searchMode,
    isTreeViewDisabled,
    loading,
    headerLoading,
    keysState,
    shownColumns,
    selectedIndex,
    handleRefreshKeys,
    handleEnableAutoRefresh,
    handleChangeAutoRefreshRate,
    handleToggleColumn,
    openAddKeyPanel,
    handleSwitchView,
  } = useKeysBrowserPanel()

  return (
    <AutoSizer disableHeight>
      {({ width }) => (
        <Row align="center" justify="between" style={{ width }}>
          <Row gap="m" align="center" grow={false}>
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
              <ColumnsMenu
                shownColumns={shownColumns}
                onToggleColumn={handleToggleColumn}
              />
            </FlexItem>
            {viewType === KeyViewType.Tree && (
              <FlexItem>
                <KeyTreeSettings loading={headerLoading} />
              </FlexItem>
            )}
          </Row>
          <Row gap="l" align="center" grow={false}>
            <FlexItem>
              <ActionIconButton
                icon={PlusIcon}
                variant="secondary"
                aria-label="Add key"
                onClick={openAddKeyPanel}
                data-testid="btn-add-key"
              />
            </FlexItem>
            <FlexItem>
              <ViewSwitch
                viewType={viewType}
                isTreeViewDisabled={isTreeViewDisabled}
                onChange={handleSwitchView}
              />
            </FlexItem>
          </Row>
        </Row>
      )}
    </AutoSizer>
  )
}

export default React.memo(Header)
