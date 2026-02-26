import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import PageBody from 'uiSrc/components/base/layout/page/PageBody'

export const StyledContainer = styled(PageBody)`
  height: max-content;
  max-height: 100%;
  overflow: hidden;
  overflow-y: auto;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.globals.body.bgColor};
  border: 1px dashed
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  align-items: center;
  justify-content: center;
`
