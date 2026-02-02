import React from 'react'
import { isNull } from 'lodash'
import styled from 'styled-components'

import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { RiTooltip } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { TextButton } from '@redis-ui/components'
import { Text } from 'uiSrc/components/base/text'
import { Theme } from 'uiSrc/components/base/theme/types'
import * as S from './ScanMore.styles'

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

const WARNING_MESSAGE =
  'Scanning additional keys may decrease performance and memory available.'

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
}: Props) => (
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
        <Text size="s">Scan more</Text>
        {withAlert && (
          <RiTooltip content={WARNING_MESSAGE} position="top">
            <S.Anchor>
              <RiIcon color="primary400" size="m" type="InfoIcon" />
            </S.Anchor>
          </RiTooltip>
        )}
      </ScanMoreButton>
    )}
  </>
)

export default ScanMore
