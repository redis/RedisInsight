import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

// Groups the editor-type and copy/download buttons on the right of the top row.
// CopyButton flex-centers its own tooltip trigger while a bare IconButton tooltip
// does not, which leaves the icons ~1-2px out of line. Normalising every
// tooltip-trigger span here keeps the icons on the same baseline.
export const TopRowActions = styled(Row)`
  & span[data-state] {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`
