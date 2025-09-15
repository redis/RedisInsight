import React from 'react'
import { isNull } from 'lodash'

import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { RiTooltip } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { TextButton } from '@redis-ui/components'
import { Text } from 'uiSrc/components/base/text'

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
      <TextButton
        variant="primary-inline"
        style={{ margin: '0 0 0 16px', lineHeight: 'inherit' }}
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
          <RiTooltip
            anchorClassName="scan-more-tooltip"
            content={WARNING_MESSAGE}
            position="top"
            style={{ height: 16 }}
          >
            <RiIcon size="m" type="InfoIcon" />
          </RiTooltip>
        )}
      </TextButton>
    )}
  </>
)

export default ScanMore
