import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Link = styled.span<{ $iconRight?: boolean }>`
  width: auto;
  white-space: nowrap;
  font:
    normal normal normal 13px/30px Graphik,
    sans-serif;
  font-weight: normal;

  & > button {
    align-items: flex-start;
    height: auto;

    svg {
      margin-top: 4px;
      margin-right: 6px;
    }
  }

  ${({ $iconRight }) =>
    $iconRight &&
    css`
      & > button {
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-between;

        svg {
          margin-right: -8px;
          margin-left: 12px;
        }
      }
    `}
`

export const Content = styled.span`
  max-width: 100%;
`

export const Title = styled.div`
  font-weight: 500;
  font-size: 12px;
  line-height: 24px;
  text-decoration: underline;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Summary = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.icon.neutral600};
`
