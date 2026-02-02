import styled from 'styled-components'
import { RiTooltip } from 'uiSrc/components/base/tooltip/RITooltip'

/**
 * Styled tooltip for column name cells (Database, Subscription)
 */
export const ColumnNameTooltip = styled(RiTooltip)`
  max-width: 370px;

  * {
    line-height: 1.19;
    font-size: 14px;
  }
`

/**
 * Styled tooltip for status/alert cells
 */
export const StatusTooltip = styled(RiTooltip)`
  width: 375px;
  max-width: 375px;
  padding-left: 15px;
  padding-top: 15px;
  font-size: 14px;
`
