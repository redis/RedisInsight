import styled from 'styled-components'

import { Row } from 'uiSrc/components/base/layout/flex'

export const StyledCellNameWrapper = styled(Row)`
  > * {
    flex-shrink: 0;
  }

  > span:last-child {
    flex-shrink: 1;
    min-width: 0;
    overflow: hidden;
  }
`
