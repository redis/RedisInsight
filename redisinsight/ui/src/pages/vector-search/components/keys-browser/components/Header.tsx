import React from 'react'

import { AutoRefresh } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { KeyTreeSettings } from 'uiSrc/pages/browser/components/key-tree'

import { useKeysBrowser } from '../hooks/useKeysBrowser'

const Header = () => {
  const {
    loading,
    keysState,
    handleRefreshKeys,
    handleEnableAutoRefresh,
    handleChangeAutoRefreshRate,
  } = useKeysBrowser()

  return (
    <Row align="center" justify="between">
      <FlexItem grow={false}>
        <Text size="m" variant="semiBold">
          Select key
        </Text>
      </FlexItem>
      <Row gap="m" align="center" grow={false}>
        <FlexItem>
          <AutoRefresh
            iconSize="S"
            postfix="vs-keys"
            loading={loading}
            lastRefreshTime={keysState.lastRefreshTime}
            displayText={false}
            onRefresh={handleRefreshKeys}
            onEnableAutoRefresh={handleEnableAutoRefresh}
            onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
            testid="vs-keys"
          />
        </FlexItem>
        <FlexItem>
          <KeyTreeSettings loading={loading} />
        </FlexItem>
      </Row>
    </Row>
  )
}

export default React.memo(Header)
