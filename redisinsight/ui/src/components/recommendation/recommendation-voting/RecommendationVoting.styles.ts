import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const VoteContent = styled.div`
  margin-left: 10px;

  svg {
    width: 34px;
    height: 34px;
    fill: none;

    path {
      stroke: ${({ theme }: { theme: Theme }) =>
        theme.semantic.color.text.neutral600};
    }
  }
`
