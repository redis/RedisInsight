import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div`
  min-height: 1px;
  height: 100%;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  text-align: left;
  letter-spacing: 0;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  position: relative;
  display: flex;
  flex-direction: column;
`

export const Header = styled.div`
  padding: 6px 0;
  width: 100%;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};

  & > div {
    width: 100%;
    padding: 0 16px;
  }

  .euiPopover {
    width: 100%;
  }
`

export const Footer = styled.div`
  width: 100%;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
`

export const PageTitle = styled.span`
  margin: 8px 0 4px;
  font:
    normal normal 500 14px/24px Graphik,
    sans-serif;
`

export const BackButton = styled.div`
  padding: 0 4px;
  max-height: 30px;
  line-height: 24px;
  width: 100%;

  & > button {
    font:
      normal normal 14px/24px Graphik,
      sans-serif;
    text-decoration: none;
    color: ${({ theme }: { theme: Theme }) =>
      theme.components.typography.colors.secondary};

    & > span {
      justify-content: flex-start;
    }

    &:hover {
      background-color: ${({ theme }: { theme: Theme }) =>
        theme.semantic.color.background.neutral300};
      color: ${({ theme }: { theme: Theme }) =>
        theme.components.typography.colors.primary};
      text-decoration: none;
    }
  }
`

export const Content = styled.div`
  scrollbar-width: thin;
  padding: 8px 12px 4px 16px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  flex: 1;
`

export const POPOVER_MIN_WIDTH = '356px'

export const PopoverAnchor = styled.span`
  width: 100%;
`

export const RocketIcon = styled.span`
  position: absolute;
  margin-top: 6px;
`

export const PopoverTitle = styled.span`
  padding-left: 45px;
  font-size: 16px;
  font-weight: 500;
`

export const PopoverText = styled.span`
  padding-left: 45px;
  padding-top: 4px;
  font-size: 14px;
  line-height: 1.1rem;
`
