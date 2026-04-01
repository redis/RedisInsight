import React from 'react'
import { useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'

import {
  vectorSetDataSelector,
  vectorSetSelector,
} from 'uiSrc/slices/browser/vectorSet'
import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { KeyDetailsHeaderFormatter } from 'uiSrc/pages/browser/modules/key-details-header/components/key-details-header-formatter'

import * as S from './VectorSetKeySubheader.styles'

const VectorSetKeySubheader = () => {
  const { showElementsPreview } = useSelector(vectorSetSelector)
  const { elements, total } = useSelector(vectorSetDataSelector)

  return (
    <S.Container>
      <AutoSizer disableHeight>
        {({ width = 0 }) => (
          <div style={{ width }}>
            <Row
              justify={showElementsPreview ? 'between' : 'end'}
              align="center"
            >
              {showElementsPreview && (
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
              <FlexItem>
                <KeyDetailsHeaderFormatter width={width} />
              </FlexItem>
            </Row>
          </div>
        )}
      </AutoSizer>
    </S.Container>
  )
}

export { VectorSetKeySubheader }
