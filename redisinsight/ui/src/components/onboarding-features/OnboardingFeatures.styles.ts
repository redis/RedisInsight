import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Pre = styled.pre`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral300};
  word-wrap: break-word;
  max-height: 240px;
  overflow-y: auto;
  scrollbar-width: thin;
`
