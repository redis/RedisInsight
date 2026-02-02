import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Content = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

export const Loading = styled.div`
  display: block;
  width: 100%;
`

export const Header = styled.div`
  padding: 0 15px 0;
`

export const HeaderTop = styled.div`
  display: flex;
  align-items: center;
`

export const Title = styled.span`
  font:
    normal normal 500 18px/22px Graphik,
    sans-serif;
`

export const Actions = styled(Row)`
  min-height: 36px;
  background: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  padding: 8px 16px;
`

export const Body = styled.div`
  padding: 8px 15px 24px;
  flex-grow: 1;
  scrollbar-width: thin;
  overflow-y: auto;
`

export const Footer = styled.div`
  min-height: 26px;
  background: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral300};
  display: flex;
  justify-content: center;
  align-items: center;
`

export const FooterIcon = styled.span`
  width: 32px;
  height: 22px;
  margin-right: 16px;
  display: flex;
  align-items: center;
`

export const FooterText = styled.span`
  font:
    normal normal 400 12px/14px Graphik,
    sans-serif;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
`

export const FooterLink = styled.button`
  font:
    normal normal 400 12px/14px Graphik,
    sans-serif;
  padding: 2px 0 0;
  margin: 0;
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};

  &:hover {
    text-decoration: none;
  }
`

export const GithubIcon = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.primary};
`

export const InfoIcon = styled.span`
  fill: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.primary};
  cursor: pointer;
  display: flex;
`

export const TooltipAnchor = styled.span`
  svg {
    vertical-align: middle;
  }
`

export const TOOLTIP_MAX_WIDTH = '314px'

export const HideCheckbox = styled.div``

export const HideBtn = styled.span`
  margin-bottom: 3px;
`
