import styled from 'styled-components'

import { Col } from 'uiSrc/components/base/layout/flex'

export const ButtonWrapper = styled(Col)`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) =>
    `${theme.core.space.space150} ${theme.core.space.space100}`};
  border-radius: ${({ theme }) => theme.core.space.space050};
  border: 1px solid ${({ theme }) => theme.color.dusk200};

  &:hover,
  &:focus {
    border: 1px solid ${({ theme }) => theme.color.dusk700};
  }
`
