import styled from 'styled-components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'
import { Title } from 'uiSrc/components/base/text/Title'

export const POPOVER_MIN_WIDTH = '312px'

export const Popover = styled.div`
  padding: 6px 15px 12px;
`

export const HelpMenuTitle = styled(Title)`
  font-size: 18px;
`

export const HelpMenuItems = styled(Row)``

export const HelpMenuItem = styled(FlexItem)`
  align-items: center;
  cursor: pointer;
`

export const HelpMenuItemLink = styled.div`
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary500};

  &:hover {
    background: none;
    transform: translateY(-1px);
  }
`

export const HelpMenuItemRow = styled(FlexItem)``

export const HelpMenuItemRowLink = styled(Row)`
  &:not(:last-child) {
    margin-bottom: 16px;
  }
`

export const HelpMenuTextLink = styled.span`
  font-size: 13px;
  line-height: 16px;
  text-decoration: none;
  cursor: pointer;
  padding: 0;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary500};

  &:hover {
    background: none;
    text-decoration: underline;
  }
`

export const HelpMenuText = styled.span`
  font-size: 13px;
  line-height: 1.35;
`

export const HelpMenuItemNotified = styled.div`
  position: relative;
  display: flex;

  &:before {
    content: '';
    position: absolute;
    right: 6px;
    top: -3px;
    display: block;
    width: 6px;
    height: 6px;
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.primary500};
    border-radius: 100%;
  }
`
