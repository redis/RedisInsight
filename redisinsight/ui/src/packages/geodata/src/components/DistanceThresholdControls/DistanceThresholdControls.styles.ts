import styled from 'styled-components'

import { Card } from 'uiSrc/components/base/layout/card'

export const Panel = styled(Card)`
  position: absolute;
  top: ${({ theme }) => theme.core.space.space100};
  left: ${({ theme }) => theme.core.space.space800};
  z-index: 1100;
  width: fit-content;
  max-width: calc(100% - ${({ theme }) => theme.core.space.space800} * 2);
  padding: ${({ theme }) => theme.core.space.space100};
  border: none;
  box-shadow: 0 0 0 1px
    ${({ theme }) => theme.semantic.color.border.neutral600};
`
