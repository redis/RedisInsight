import styled from 'styled-components'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'

export const StyledSocialButton = styled(EmptyButton)<{ $inline?: boolean }>`
  padding: 8px;
  transition: transform 0.3s ease;

  &:hover,
  &:focus {
    background: none;
    transform: translateY(-1px);
  }

  ${({ $inline }) =>
    $inline &&
    `    
    svg {
        height: 20px;
        width: 20px;
    }
  `}

  svg {
    height: 34px;
    width: 34px;
  }
`
