import React from 'react'
import { useSelector } from 'react-redux'

import {
  LENGTH_NAMING_BY_TYPE,
  MIDDLE_SCREEN_RESOLUTION,
} from 'uiSrc/constants'
import {
  initialKeyInfo,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import { formatBytes } from 'uiSrc/utils'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import styles from './styles.module.scss'

export interface Props {
  width: number
}

const KeyDetailsHeaderSizeLength = ({ width }: Props) => {
  const { type, size, length, quantType, vectorDim } =
    useSelector(selectedKeyDataSelector) ?? initialKeyInfo

  const isSizeTooLarge = size === -1

  return (
    <>
      {size && (
        <FlexItem>
          <Text
            size="s"
            className={styles.subtitleText}
            data-testid="key-size-text"
          >
            <RiTooltip
              title="Key Size"
              position="left"
              content={
                <>
                  {isSizeTooLarge
                    ? 'The key size is too large to run the MEMORY USAGE command, as it may lead to performance issues.'
                    : formatBytes(size, 3)}
                </>
              }
            >
              <>
                {width > MIDDLE_SCREEN_RESOLUTION && 'Key Size: '}
                {formatBytes(size, 0)}
                {isSizeTooLarge && (
                  <>
                    {' '}
                    <RiIcon
                      className={styles.infoIcon}
                      type="InfoIcon"
                      size="m"
                      style={{ cursor: 'pointer' }}
                      data-testid="key-size-info-icon"
                    />
                  </>
                )}
              </>
            </RiTooltip>
          </Text>
        </FlexItem>
      )}
      <FlexItem>
        <Text
          size="s"
          className={styles.subtitleText}
          data-testid="key-length-text"
        >
          {LENGTH_NAMING_BY_TYPE[type] ?? 'Length'}
          {': '}
          {length ?? '-'}
        </Text>
      </FlexItem>
      {quantType && (
        <FlexItem>
          <Text
            size="s"
            className={styles.subtitleText}
            data-testid="key-quant-type-text"
          >
            {width > MIDDLE_SCREEN_RESOLUTION ? 'Quant type: ' : 'Q: '}
            {quantType}
          </Text>
        </FlexItem>
      )}
      {vectorDim !== undefined && (
        <FlexItem>
          <Text
            size="s"
            className={styles.subtitleText}
            data-testid="key-vector-dim-text"
          >
            {width > MIDDLE_SCREEN_RESOLUTION ? 'Vector dim: ' : 'Dim: '}
            {vectorDim}
          </Text>
        </FlexItem>
      )}
    </>
  )
}

export { KeyDetailsHeaderSizeLength }
