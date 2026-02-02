import React from 'react'
import { isNull } from 'lodash'
import { useSelector } from 'react-redux'

import { Text, ColorText } from 'uiSrc/components/base/text'

import { numberWithSpaces, nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import { keysSelector } from 'uiSrc/slices/browser/keys'
import { KeyTreeSettings } from 'uiSrc/pages/browser/components/key-tree'

import ScanMore from '../scan-more'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import * as S from './KeysSummary.styles'

export interface Props {
  loading: boolean
  items: any[]
  showScanMore?: boolean
  scanned?: number
  totalItemsCount?: number
  nextCursor?: string
  scanMoreStyle?: {
    [key: string]: string | number
  }
  loadMoreItems?: (config: any) => void
}

const KeysSummary = (props: Props) => {
  const {
    items = [],
    loading,
    showScanMore = true,
    scanned = 0,
    totalItemsCount = 0,
    scanMoreStyle,
    loadMoreItems,
    nextCursor,
  } = props

  const resultsLength = items.length
  const scannedDisplay = resultsLength > scanned ? resultsLength : scanned
  const notAccurateScanned =
    totalItemsCount &&
    scanned >= totalItemsCount &&
    nextCursor &&
    nextCursor !== '0'
      ? '~'
      : ''

  const { viewType } = useSelector(keysSelector)

  return (
    <>
      {(!!totalItemsCount || isNull(totalItemsCount)) && (
        <Row align="center" gap="l" data-testid="keys-summary">
          {!!scanned && (
            <FlexItem>
              <Row gap="s">
                <ColorText size="s" variant="semiBold" component="span">
                  {'Results: '}
                  <span data-testid="keys-number-of-results">
                    {numberWithSpaces(resultsLength)}
                  </span>
                  {'. '}
                </ColorText>
                <ColorText size="s" color="secondary" component="span">
                  {'Scanned '}
                  <span data-testid="keys-number-of-scanned">
                    {notAccurateScanned}
                    {numberWithSpaces(scannedDisplay)}
                  </span>
                  {' / '}
                  <span data-testid="keys-total">
                    {nullableNumberWithSpaces(totalItemsCount)}
                  </span>
                  <S.Loading $show={loading} />
                </ColorText>
              </Row>
            </FlexItem>
          )}
          {!scanned && (
            <FlexItem>
              <Text size="s" variant="semiBold" component="span">
                {'Total: '}
                {nullableNumberWithSpaces(totalItemsCount)}
              </Text>
            </FlexItem>
          )}
          {showScanMore && (
            <FlexItem>
              <ScanMore
                withAlert
                fill={false}
                style={scanMoreStyle}
                scanned={scanned}
                totalItemsCount={totalItemsCount}
                loading={loading}
                loadMoreItems={loadMoreItems}
                nextCursor={nextCursor}
              />
            </FlexItem>
          )}
          {viewType === KeyViewType.Tree && (
            <FlexItem>
              <KeyTreeSettings loading={loading} />
            </FlexItem>
          )}
        </Row>
      )}
      {loading && !totalItemsCount && !isNull(totalItemsCount) && (
        <Row align="center">
          <FlexItem>
            <Text size="s" data-testid="scanning-text">
              Scanning...
            </Text>
          </FlexItem>
        </Row>
      )}
    </>
  )
}

export default KeysSummary
