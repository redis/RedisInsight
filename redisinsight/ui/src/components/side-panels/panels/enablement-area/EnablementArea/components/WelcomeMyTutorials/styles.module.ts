import styled from 'styled-components'

import { Row } from 'uiSrc/components/base/layout/flex'

export const StyledRow = styled(Row)`
  padding: ${({ theme }) => theme.core.space.space100};
`

export const TutorialText = styled.span`
  @media only screen and (max-width: 1440px) {
    display: none;
  }
`
