import React from 'react'
import { useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'

import { vectorSetDataSelector } from 'uiSrc/slices/browser/vectorSet'
import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import Divider from 'uiSrc/components/divider/Divider'
import { KeyDetailsHeaderFormatter } from 'uiSrc/pages/browser/modules/key-details-header/components/key-details-header-formatter'
import { AddItemsAction } from 'uiSrc/pages/browser/modules/key-details/components/key-details-actions'

import * as S from './VectorSetKeySubheader.styles'
import { Props } from './VectorSetKeySubheader.types'

const VectorSetKeySubheader = ({ openAddItemPanel }: Props) => {
  const { total, elements, isPaginationSupported } = useSelector(
    vectorSetDataSelector,
  )
  const showPreview = isPaginationSupported === false

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
                      ? `Previewing ${elements.length} out of ${total}`
                      : `${elements.length} out of ${total}`}
                  </Text>
                </FlexItem>
              )}
              <Row align="center" grow={false}>
                <KeyDetailsHeaderFormatter width={width} />
                <Divider orientation="vertical" />
                <AddItemsAction
                  title="Add Elements"
                  width={width}
                  openAddItemPanel={openAddItemPanel}
                />
              </Row>
            </Row>
          </div>
        )}
      </AutoSizer>
    </S.Container>
  )
}

export { VectorSetKeySubheader }
