import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div`
  padding: 0 16px;
  height: 70px;
`

export const BreadcrumbsContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;

  & > div {
    display: flex;
  }
`

export const BreadCrumbLink = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary500};
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export const TOOLTIP_MAX_WIDTH = '400px'

export const TooltipAnchor = styled.span`
  max-width: 100%;
  display: inline-flex;

  &:hover .infoIcon {
    color: currentColor;
  }
`

export const DbName = styled.b`
  display: inline-block;
  overflow: hidden;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  text-overflow: ellipsis;
  max-width: 100%;
  white-space: nowrap;
`

export const InfoIcon = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.icon.neutral600};
  transition: color ease 0.3s;
`

export const ButtonDbIndex = styled.span`
  height: 32px;
`

export const Controls = styled.span`
  height: 32px;
`

export const DbIndexInput = styled.span`
  width: 60px;
  height: 32px;
`

export const Divider = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  margin: 0 8px;
`

// InstancesNavigationPopover styles
export const NavPopoverBreadcrumbLink = styled.span`
  cursor: pointer;
  text-decoration: underline;
  max-width: 300px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  &:hover {
    text-decoration: none;
  }
`

export const Wrapper = styled.div`
  width: 450px;
  font-size: 14px;
  line-height: 16.8px;
`

export const SearchInputContainer = styled.div`
  padding: 16px;
`

export const TabsContainer = styled.div`
  padding: 0 16px;
`

export const FooterContainer = styled.div`
  padding: 12px 16px;
`

export const HomePageLink = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  font-size: 14px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

export const ListContainer = styled.div`
  scrollbar-width: thin;
  max-height: 160px;
  overflow-y: auto;

  .RI-list-group-item.isActive,
  .RI-list-group-item:hover {
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral300};
    color: ${({ theme }: { theme: Theme }) =>
      theme.components.typography.colors.primary};
    border-left: 3px solid
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.primary500};
    text-decoration: none;
  }
`

export const Item = styled.div`
  padding-left: 10px;
  font-size: 14px;
  line-height: 16.8px;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
`

export const Loading = styled.span`
  margin-right: 8px;
`

export const EmptyMsg = styled.div`
  padding: 20px;
  text-align: center;
  font-size: 14px;
  line-height: 16.8px;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
`
