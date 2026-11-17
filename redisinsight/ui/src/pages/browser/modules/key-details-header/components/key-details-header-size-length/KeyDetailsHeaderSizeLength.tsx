import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

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
import { useTranslation } from 'uiSrc/i18n'
import styles from './styles.module.scss'

export interface Props {
  width: number
}

const KeyDetailsHeaderSizeLength = ({ width }: Props) => {
  const { type, size, length, quantType, vectorDim, count } =
    useAppSelector(selectedKeyDataSelector) ?? initialKeyInfo
  const { t } = useTranslation()

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
              title={t('browser.keyDetails.size.tooltipTitle')}
              position="left"
              content={
                <>
                  {isSizeTooLarge
                    ? t('browser.keyDetails.size.tooLarge')
                    : formatBytes(size, 3)}
                </>
              }
            >
              <>
                {width > MIDDLE_SCREEN_RESOLUTION &&
                  t('browser.keyDetails.size.label')}
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
          {t(
            LENGTH_NAMING_BY_TYPE[type] ?? 'browser.keyDetails.length.default',
          )}
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
            {width > MIDDLE_SCREEN_RESOLUTION
              ? t('browser.keyDetails.quantType.full')
              : t('browser.keyDetails.quantType.short')}
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
            {width > MIDDLE_SCREEN_RESOLUTION
              ? t('browser.keyDetails.vectorDim.full')
              : t('browser.keyDetails.vectorDim.short')}
            {vectorDim}
          </Text>
        </FlexItem>
      )}
      {count !== undefined && (
        <FlexItem>
          <Text
            size="s"
            className={styles.subtitleText}
            data-testid="key-count-text"
          >
            {width > MIDDLE_SCREEN_RESOLUTION
              ? t('browser.keyDetails.count.full')
              : t('browser.keyDetails.count.short')}
            {count}
          </Text>
        </FlexItem>
      )}
    </>
  )
}

export { KeyDetailsHeaderSizeLength }
