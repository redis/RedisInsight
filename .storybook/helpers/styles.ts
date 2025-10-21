import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import PageBody from 'uiSrc/components/base/layout/page/PageBody'

export const StyledContainer = styled(PageBody)`
  height: max-content;
  max-height: 100%;
  overflow: hidden;
  overflow-y: auto;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  border: 2px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
`
