import styled from 'styled-components'

import { Row } from 'uiSrc/components/base/layout/flex'

export const CellContainer = styled(Row)`
  button {
    opacity: 0;
    transition: opacity 250ms ease-in-out;
  }

  &:hover button {
    opacity: 1;
  }
`
