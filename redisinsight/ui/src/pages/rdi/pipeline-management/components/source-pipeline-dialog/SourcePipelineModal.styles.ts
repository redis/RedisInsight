import styled from 'styled-components'

import { Col } from 'uiSrc/components/base/layout/flex'

export const ButtonWrapper = styled(Col)`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  border-radius: ${({ theme }) => theme.core.space.space050};
  border: 1px solid ${({ theme }) => theme.color.dusk200};

  &:hover,
  &:focus {
    border: 1px solid ${({ theme }) => theme.color.dusk700};
  }
`
