import React from 'react'
import { isNull } from 'lodash'
import styled from 'styled-components'

import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { RiTooltip } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { TextButton } from '@redis-ui/components'
import { Text } from 'uiSrc/components/base/text'
import { Theme } from 'uiSrc/components/base/theme/types'
import { useTranslation } from 'uiSrc/i18n'
import styles from './styles.module.scss'

export interface Props {
  withAlert?: boolean
  fill?: boolean
  loading: boolean
  scanned?: number
  totalItemsCount?: number
  nextCursor?: string
  style?: {
    [key: string]: string | number
  }
  loadMoreItems?: (config: any) => void
}

const ScanMoreButton = styled(TextButton)`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary400} !important;
  line-height: inherit;
`

const ScanMore = ({
  withAlert = true,
  scanned = 0,
  totalItemsCount = 0,
  loading,
  loadMoreItems,
  nextCursor,
}: Props) => {
  const { t } = useTranslation()
  return (
    <>
      {(scanned || isNull(totalItemsCount)) && nextCursor !== '0' && (
        <ScanMoreButton
          disabled={loading}
          onClick={() =>
            loadMoreItems?.({
              stopIndex: SCAN_COUNT_DEFAULT - 1,
              startIndex: 0,
            })
          }
          data-testid="scan-more"
        >
          <Text size="s">{t('browser.scanMore.button')}</Text>
          {withAlert && (
            <RiTooltip
              content={t('browser.scanMore.warning')}
              position="top"
              anchorClassName={styles.anchor}
            >
              <RiIcon color="primary400" size="m" type="InfoIcon" />
            </RiTooltip>
          )}
        </ScanMoreButton>
      )}
    </>
  )
}

export default ScanMore
