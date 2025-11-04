import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export const StyledContainer = styled.div`
  padding: 50px;
  height: max-content;
  overflow: hidden;
  overflow-y: auto;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  border: 2px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
`
