import React from 'react'
import { useSelector } from 'react-redux'

import { RiFlexItem } from 'uiBase/layout'
import { RiText } from 'uiBase/text'
import { RiIcon } from 'uiBase/icons'
import {
  LENGTH_NAMING_BY_TYPE,
  MIDDLE_SCREEN_RESOLUTION,
} from 'uiSrc/constants'
import {
  initialKeyInfo,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import { formatBytes } from 'uiSrc/utils'

import { RiTooltip } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  width: number
}

const KeyDetailsHeaderSizeLength = ({ width }: Props) => {
  const { type, size, length } =
    useSelector(selectedKeyDataSelector) ?? initialKeyInfo

  const isSizeTooLarge = size === -1

  return (
    <>
      {size && (
        <RiFlexItem>
          <RiText
            color="subdued"
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
          </RiText>
        </RiFlexItem>
      )}
      <RiFlexItem>
        <RiText
          color="subdued"
          size="s"
          className={styles.subtitleText}
          data-testid="key-length-text"
        >
          {LENGTH_NAMING_BY_TYPE[type] ?? 'Length'}
          {': '}
          {length ?? '-'}
        </RiText>
      </RiFlexItem>
    </>
  )
}

export { KeyDetailsHeaderSizeLength }
