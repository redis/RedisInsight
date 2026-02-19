import React from 'react'
import { isNull } from 'lodash'

import ScanMore from 'uiSrc/components/scan-more'
import { numberWithSpaces, nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
import { ColorText } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import * as S from '../KeysBrowser.styles'

import { useKeysBrowser } from '../hooks/useKeysBrowser'

const Footer = () => {
  const { keysState, headerLoading, isSearched, isFiltered, handleScanMore } =
    useKeysBrowser()

  const footerScanned = isSearched || isFiltered ? keysState.scanned : 0

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

  return (
    <S.FooterContainer data-testid="keys-browser-footer">
      <Row align="center" justify="between" grow data-testid="vs-keys-summary">
        <Row gap="s" align="center" grow={false}>
          {headerLoading && !keysState.total && !isNull(keysState.total) && (
            <ColorText
              size="xs"
              color="secondary"
              data-testid="vs-scanning-text"
            >
              Scanning...
            </ColorText>
          )}
          {!!footerScanned && (
            <>
              <ColorText size="xs" color="secondary" component="span">
                {'Results: '}
                <span data-testid="vs-keys-number-of-results">
                  {numberWithSpaces(keysState.keys.length)}
                </span>
                {' keys'}
              </ColorText>
              <S.Separator />
              <ColorText size="xs" color="secondary" component="span">
                {'Scanned '}
                <span data-testid="vs-keys-number-of-scanned">
                  {footerNotAccurateScanned}
                  {numberWithSpaces(footerScannedDisplay)}
                </span>
                {'/'}
                <span data-testid="vs-keys-total">
                  {nullableNumberWithSpaces(keysState.total)}
                </span>
              </ColorText>
            </>
          )}
          {!footerScanned && (!!keysState.total || isNull(keysState.total)) && (
            <ColorText size="xs" color="secondary" component="span">
              {'Total: '}
              {nullableNumberWithSpaces(keysState.total)}
            </ColorText>
          )}
        </Row>
        <FlexItem grow={false}>
          <ScanMore
            withAlert={false}
            scanned={footerScanned}
            totalItemsCount={keysState.total}
            loading={headerLoading}
            loadMoreItems={handleScanMore}
            nextCursor={keysState.nextCursor}
          />
        </FlexItem>
      </Row>
    </S.FooterContainer>
  )
}

export default React.memo(Footer)
