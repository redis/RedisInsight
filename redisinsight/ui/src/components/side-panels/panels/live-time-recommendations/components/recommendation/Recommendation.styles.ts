import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const RedisStackLink = styled.span`
  margin-right: 12px;
`

export const RedisStackIcon = styled.span`
  display: flex;
`

export const Actions = styled.div`
  display: flex;
  margin-top: 15px;
  justify-content: space-around;
  align-items: center;
  height: 48px;
`

export const FullWidthRow = styled(Row)`
  width: 100%;
`

export const VotingContainer = styled.div`
  border-radius: 8px;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  padding: 4px 0 4px 10px;
`

export const SnoozeBtn = styled.span`
  svg {
    fill: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral200};

    g,
    circle,
    path {
      stroke: currentColor;
    }
  }
`

export const HideBtn = styled.span``

export const AccordionContent = styled.div`
  .btn {
    box-shadow: none;
    display: block;
    margin-top: 1px;
    height: 32px;
    min-width: 60px;
    margin-bottom: 12px;

    svg path {
      fill: ${({ theme }: { theme: Theme }) =>
        theme.semantic.color.background.neutral100};
    }
  }
`
