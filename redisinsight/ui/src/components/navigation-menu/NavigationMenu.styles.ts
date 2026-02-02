import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const MainNavbar = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
`

export const Footer = styled.div`
  margin-bottom: 1rem;
`

export const HighlightDot = styled.span`
  top: 11px;
  right: 11px;
`

export const SideBarItem = styled.span``

export const GithubNavItem = styled.span``

export const NavigationButtonWrapper = styled.div`
  position: relative;

  .betaLabel {
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) translateY(0);
    font-size: 8px;
    line-height: 12px;
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.success500};
    border: 1px solid
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.success500};
    color: #fff7ea;
    border-radius: 2px;
    transition: transform 250ms ease-in-out;
    pointer-events: none;

    [class*='RedisUI'] {
      min-height: 12px;
    }
  }

  &:hover {
    .betaLabel {
      transform: translateX(-50%) translateY(-1px);
    }
  }
`
