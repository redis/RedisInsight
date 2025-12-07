import React, { ReactElement } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'

import { isUndefined } from 'lodash'
import Divider from 'uiSrc/components/divider/Divider'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { KeyDetailsHeaderFormatter } from '../../../key-details-header/components/key-details-header-formatter'
import styles from './styles.module.scss'

export interface Props {
  keyType: KeyTypes | ModulesKeyTypes
  Actions?: (props: { width: number }) => ReactElement
}

export const KeyDetailsSubheader = ({ keyType, Actions }: Props) => (
  <FlexItem className={styles.subheaderContainer}>
    <AutoSizer disableHeight>
      {({ width = 0 }) => (
        <div style={{ width }}>
          <Row justify="end" align="center">
            {Object.values(KeyTypes).includes(keyType as KeyTypes) && (
              <>
                <FlexItem className={styles.keyFormatterItem}>
                  <KeyDetailsHeaderFormatter width={width} />
                </FlexItem>
                <Divider
                  className={styles.divider}
                  orientation="vertical"
                />
              </>
            )}
            {!isUndefined(Actions) && <Actions width={width} />}
          </Row>
        </div>
      )}
    </AutoSizer>
  </FlexItem>
)

export default KeyDetailsSubheader
