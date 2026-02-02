import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const VotingContainer = styled(Row)`
  .voteContent {
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
  }
`

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
