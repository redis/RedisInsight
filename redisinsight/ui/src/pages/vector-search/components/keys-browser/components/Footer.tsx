import React from 'react'
import { isNull } from 'lodash'

import ScanMore from 'uiSrc/components/scan-more'
import { numberWithSpaces, nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
import { ColorText } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Trans, useTranslation } from 'uiSrc/i18n'
import * as S from '../KeysBrowser.styles'

import { useKeysBrowser } from '../hooks/useKeysBrowser'

const Footer = () => {
  const { t } = useTranslation()
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
              {t('vectorSearch.keysBrowser.scanning')}
            </ColorText>
          )}
          {!!footerScanned && (
            <>
              <ColorText size="xs" color="secondary" component="span">
                <Trans
                  i18nKey="vectorSearch.keysBrowser.results"
                  values={{ count: numberWithSpaces(keysState.keys.length) }}
                  components={{
                    resultCount: (
                      <span data-testid="vs-keys-number-of-results" />
                    ),
                  }}
                />
              </ColorText>
              <S.Separator />
              <ColorText size="xs" color="secondary" component="span">
                <Trans
                  i18nKey="vectorSearch.keysBrowser.scanned"
                  values={{
                    scanned: `${footerNotAccurateScanned}${numberWithSpaces(footerScannedDisplay)}`,
                    total: nullableNumberWithSpaces(keysState.total),
                  }}
                  components={{
                    scannedCount: (
                      <span data-testid="vs-keys-number-of-scanned" />
                    ),
                    totalCount: <span data-testid="vs-keys-total" />,
                  }}
                />
              </ColorText>
            </>
          )}
          {!footerScanned && (!!keysState.total || isNull(keysState.total)) && (
            <ColorText size="xs" color="secondary" component="span">
              {t('vectorSearch.keysBrowser.total', {
                total: nullableNumberWithSpaces(keysState.total),
              })}
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
