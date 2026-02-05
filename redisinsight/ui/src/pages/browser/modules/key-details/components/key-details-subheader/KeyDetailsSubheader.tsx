import React, { ReactElement } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'

import { isUndefined } from 'lodash'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { Row } from 'uiSrc/components/base/layout/flex'
import * as S from './KeyDetailsSubheader.styles'
import { KeyDetailsHeaderFormatter } from '../../../key-details-header/components/key-details-header-formatter'

export interface Props {
  keyType: KeyTypes | ModulesKeyTypes
  Actions?: (props: { width: number }) => ReactElement
}

export const KeyDetailsSubheader = ({ keyType, Actions }: Props) => (
  <S.SubHeaderContainer>
    <AutoSizer disableHeight>
      {({ width = 0 }) => (
        <div style={{ width }}>
          <Row justify="end" align="center">
            {Object.values(KeyTypes).includes(keyType as KeyTypes) && (
              <>
                <div>
                  <KeyDetailsHeaderFormatter width={width} />
                </div>
                <S.StyledDivider orientation="vertical" />
              </>
            )}
            {!isUndefined(Actions) && <Actions width={width} />}
          </Row>
        </div>
      )}
    </AutoSizer>
  </S.SubHeaderContainer>
)

export default KeyDetailsSubheader
