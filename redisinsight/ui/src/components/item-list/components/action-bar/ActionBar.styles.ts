import styled from 'styled-components'

import { Row } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Row)`
  position: fixed;
  z-index: 1;
  left: 50%;
  transform: translate(-50%, -50%);

  width: 462px;
  height: 50px;
  bottom: calc(9vh + 9px);
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral500};
  border-radius: ${({ theme }) => theme.core.space.space250};
  padding-left: ${({ theme }) => theme.core.space.space050};
`
