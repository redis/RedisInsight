import React from 'react'

import { AutoRefresh } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Title } from 'uiSrc/components/base/text'
import { KeyTreeSettings } from 'uiSrc/pages/browser/components/key-tree'

import { useKeysBrowser } from '../hooks/useKeysBrowser'
import * as S from '../KeysBrowser.styles'

const Header = () => {
  const {
    loading,
    keysState,
    handleRefreshKeys,
    handleEnableAutoRefresh,
    handleChangeAutoRefreshRate,
  } = useKeysBrowser()

  return (
    <S.HeaderWrapper>
      <Row align="center" justify="between">
        <FlexItem grow={false}>
          <Title size="S" variant="semiBold" color="primary">
            Select key
          </Title>
        </FlexItem>
        <Row gap="m" align="center" grow={false}>
          <FlexItem>
            <AutoRefresh
              iconSize="S"
              postfix="vs-keys"
              loading={loading}
              lastRefreshTime={keysState.lastRefreshTime}
              displayLastRefresh={false}
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
    </S.HeaderWrapper>
  )
}

export default React.memo(Header)
