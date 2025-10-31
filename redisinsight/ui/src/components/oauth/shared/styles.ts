import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'

export const StyledAdvantagesContainerAbsolute = styled(FlexItem)`
  background: ${({ theme }) => theme.semantic.color.background.neutral200};
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  padding: 32px;
  border-radius: 0.8rem;
`
