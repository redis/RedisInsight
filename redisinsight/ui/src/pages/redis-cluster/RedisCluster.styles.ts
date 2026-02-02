import styled from 'styled-components'
import { RiTooltip } from 'uiSrc/components/base/tooltip/RITooltip'

export const ColumnNameTooltip = styled(RiTooltip)`
  max-width: 370px;
  * {
    line-height: 1.19;
    font-size: 14px;
  }
`

/**
 * Popover panel max-width for cancel button - passed as maxWidth prop to RiPopover
 */
export const CANCEL_POPOVER_WIDTH = '350px'
