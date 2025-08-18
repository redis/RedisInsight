import React, { ReactElement } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { isUndefined } from 'lodash'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import Divider from 'uiSrc/components/divider/Divider'
import { KeyTypes, ModulesKeyTypes } from 'uiSrc/constants'

import { KeyDetailsHeaderFormatter } from '../../../key-details-header/components/key-details-header-formatter'
import styles from './styles.module.scss'

export interface Props {
  keyType: KeyTypes | ModulesKeyTypes
  Actions?: (props: { width: number }) => ReactElement
}

export const KeyDetailsSubheader = ({ keyType, Actions }: Props) => (
  <RiFlexItem className={styles.subheaderContainer}>
    <AutoSizer disableHeight>
      {({ width = 0 }) => (
        <div style={{ width }}>
          <RiRow justify="end" align="center">
            {Object.values(KeyTypes).includes(keyType as KeyTypes) && (
              <>
                <RiFlexItem className={styles.keyFormatterItem}>
                  <KeyDetailsHeaderFormatter width={width} />
                </RiFlexItem>
                <Divider
                  className={styles.divider}
                  colorVariable="separatorColor"
                  orientation="vertical"
                />
              </>
            )}
            {!isUndefined(Actions) && <Actions width={width} />}
          </RiRow>
        </div>
      )}
    </AutoSizer>
  </RiFlexItem>
)

export default KeyDetailsSubheader
