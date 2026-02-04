import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

// Class names for VirtualTable column configuration
export const cellClassName = 'stream-data-cell'
export const actionsHeaderClassName = 'stream-data-actions-header'

export const StreamItem = styled(Row)`
  white-space: break-spaces;
  max-width: 100%;
  word-break: break-all;
`

export const ClassStyles = styled.div`
  .${cellClassName} {
    overflow: hidden;
  }

  .${actionsHeaderClassName} {
    width: 54px;
  }
`
