import React from 'react'
import { isNull } from 'lodash'

import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import ScanMore from 'uiSrc/components/scan-more'
import { numberWithSpaces, nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
import { Text, ColorText } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'

import { useKeysBrowserPanel } from '../contexts/Context'

const Footer = () => {
  const {
    viewType,
    searchMode,
    keysState,
    headerLoading,
    isSearched,
    isFiltered,
    handleScanMore,
  } = useKeysBrowserPanel()

  const footerScanned =
    isSearched ||
    (isFiltered && searchMode === SearchMode.Pattern) ||
    viewType === KeyViewType.Tree
      ? keysState.scanned
      : 0

  const footerScannedDisplay =
    keysState.keys.length > (footerScanned ?? 0)
      ? keysState.keys.length
      : (footerScanned ?? 0)

  const footerNotAccurateScanned =
    keysState.total &&
    (footerScanned ?? 0) >= keysState.total &&
    keysState.nextCursor &&
    keysState.nextCursor !== '0'
      ? '~'
      : ''

  const showScanMore = !(
    searchMode === SearchMode.Redisearch &&
    keysState.maxResults &&
    keysState.keys.length >= keysState.maxResults
  )

  return (
    <Row align="center" justify="between" grow data-testid="keys-summary">
      <FlexItem>
        {headerLoading && !keysState.total && !isNull(keysState.total) && (
          <Text size="s" data-testid="scanning-text">
            Scanning...
          </Text>
        )}
        {!!footerScanned && (
          <ColorText size="s" variant="semiBold" component="span">
            {'Results: '}
            <span data-testid="keys-number-of-results">
              {numberWithSpaces(keysState.keys.length)}
            </span>
          </ColorText>
        )}
        {!footerScanned && (!!keysState.total || isNull(keysState.total)) && (
          <Text size="s" variant="semiBold" component="span">
            {'Total: '}
            {nullableNumberWithSpaces(keysState.total)}
          </Text>
        )}
      </FlexItem>
      <Row gap="l" align="center" grow={false}>
        {!!footerScanned && (
          <FlexItem>
            <ColorText size="s" color="secondary" component="span">
              {'Scanned '}
              <span data-testid="keys-number-of-scanned">
                {footerNotAccurateScanned}
                {numberWithSpaces(footerScannedDisplay)}
              </span>
              {' / '}
              <span data-testid="keys-total">
                {nullableNumberWithSpaces(keysState.total)}
              </span>
            </ColorText>
          </FlexItem>
        )}
        {showScanMore && (
          <FlexItem>
            <ScanMore
              withAlert={false}
              scanned={footerScanned}
              totalItemsCount={keysState.total}
              loading={headerLoading}
              loadMoreItems={handleScanMore}
              nextCursor={keysState.nextCursor}
            />
          </FlexItem>
        )}
      </Row>
    </Row>
  )
}

export default React.memo(Footer)
