import React from 'react'
import { isNull } from 'lodash'

import { Button } from 'uiBase/forms'
import { RiIcon } from 'uiBase/icons'
import { RiTooltip } from 'uiBase/display'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'

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
  fill = true,
  withAlert = true,
  scanned = 0,
  totalItemsCount = 0,
  loading,
  style,
  loadMoreItems,
  nextCursor,
}: Props) => (
  <>
    {(scanned || isNull(totalItemsCount)) && nextCursor !== '0' && (
      <Button
        variant={fill ? 'primary' : 'secondary-ghost'}
        size="s"
        style={style ?? { marginLeft: 25, height: 26 }}
        disabled={loading}
        onClick={() =>
          loadMoreItems?.({
            stopIndex: SCAN_COUNT_DEFAULT - 1,
            startIndex: 0,
          })
        }
        data-testid="scan-more"
      >
        {withAlert && (
          <RiTooltip content={WARNING_MESSAGE} position="top">
            <RiIcon type="InfoIcon" />
          </RiTooltip>
        )}
        Scan more
      </Button>
    )}
  </>
)

export default ScanMore
