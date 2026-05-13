import React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'

import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { KeyDetailsHeaderFormatter } from 'uiSrc/pages/browser/modules/key-details-header/components/key-details-header-formatter'
import { AddItemsAction } from 'uiSrc/pages/browser/modules/key-details/components/key-details-actions'

import { ClearResultsAction } from '../clear-results-action'
import * as S from './VectorSetKeySubheader.styles'
import { Props } from './VectorSetKeySubheader.types'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

const VectorSetKeySubheader = ({
  openAddItemPanel,
  showPreview,
  previewCount,
  total,
  hasSimilarityResults,
  onClearResults,
  additionalActions,
}: Props) => {
  return (
    <S.Container>
      <AutoSizer disableHeight>
        {({ width = 0 }) => (
          <div style={{ width }}>
            <Row justify={showPreview ? 'between' : 'end'} align="center">
              {showPreview && (
                <FlexItem grow={false}>
                  <Text
                    size="s"
                    color="primary"
                    data-testid="vector-set-preview-summary"
                  >
                    {width > MIDDLE_SCREEN_RESOLUTION
                      ? `Previewing ${previewCount} out of ${total}`
                      : `${previewCount} out of ${total}`}
                  </Text>
                </FlexItem>
              )}
              <Row align="center" grow={false}>
                <KeyDetailsHeaderFormatter width={width} />
                {hasSimilarityResults ? (
                  <ClearResultsAction
                    width={width}
                    onClick={onClearResults}
                    testIdPrefix="similarity-search"
                  />
                ) : (
                  <AddItemsAction
                    title="Add Elements"
                    width={width}
                    openAddItemPanel={openAddItemPanel}
                  />
                )}
                {additionalActions ? (
                  <>
                    <Spacer size="l" direction="horizontal" />
                    {additionalActions(width)}
                  </>
                ) : null}
              </Row>
            </Row>
          </div>
        )}
      </AutoSizer>
    </S.Container>
  )
}

export { VectorSetKeySubheader }
