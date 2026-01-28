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
import { RiTooltip } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import * as S from './KeyDetailsHeaderSizeLength.styles'

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
        <FlexItem>
          <S.SubtitleText size="s" data-testid="key-size-text">
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
                      type="InfoIcon"
                      size="m"
                      style={{ cursor: 'pointer' }}
                      data-testid="key-size-info-icon"
                    />
                  </>
                )}
              </>
            </RiTooltip>
          </S.SubtitleText>
        </FlexItem>
      )}
      <FlexItem>
        <S.SubtitleText size="s" data-testid="key-length-text">
          {LENGTH_NAMING_BY_TYPE[type] ?? 'Length'}
          {': '}
          {length ?? '-'}
        </S.SubtitleText>
      </FlexItem>
    </>
  )
}

export { KeyDetailsHeaderSizeLength }
