import styled from 'styled-components'
import { HTMLAttributes } from 'react'
import { type Theme } from 'uiSrc/components/base/theme/types'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { ColorText } from 'uiSrc/components/base/text'

export const Container = styled(Col)`
  padding: 0 ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  border-bottom: ${({ theme }: { theme: Theme }) =>
    theme.components.sideBar.collapsed.borderRight};
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space800};
`

export const HeaderRow = styled(Row)`
  height: 100%;
`

export const BreadcrumbsWrapper = styled(FlexItem)`
  overflow: hidden;
`

export const BreadcrumbsContent = styled.div`
  flex: 1;
  overflow: hidden;
`

export const BreadcrumbsMaxWidth = styled.div`
  max-width: 100%;
`

export const ReturnToItem = styled(FlexItem)`
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space050} ${theme.core.space.space200} ${theme.core.space.space050} 0`};
`

export const DbIndexEditorWrapper = styled.div`
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space600};
`

export const LeftMarginFlexItem = styled(FlexItem)`
  margin-left: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
`

export const BreadcrumbsContainer = styled(Row)`
  height: 100%;

  & > div {
    display: flex;
  }
  & .tooltip-anchor {
    max-width: 100%;
    display: block;
    line-height: 1;
    height: min-content;
    cursor: pointer;
  }
  & .tooltip-anchor:hover .infoIcon {
    color: currentColor;
  }
`

export const InfoIcon = styled.span<HTMLAttributes<HTMLSpanElement>>`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.icon.neutral600};
  transition: color ease 0.3s;
  cursor: pointer;
  line-height: 1;
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: center;
`

export const BreadCrumbLink = styled(ColorText)`
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export const TOOLTIP_MAX_WIDTH = '400px'

export const DbName = styled(ColorText)`
  display: inline-block;
  overflow: hidden;
  max-width: 100%;
  white-space: nowrap;
`

export const Controls = styled.span`
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space400};
`

export const DbIndexInput = styled.span`
  width: ${({ theme }: { theme: Theme }) => theme.core.space.space600};
`

export const Divider = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
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
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`

export const TabsContainer = styled.div`
  padding: 0 ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`

export const FooterContainer = styled.div`
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space150} ${theme.core.space.space200}`};
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
    border-left: ${({ theme }: { theme: Theme }) =>
      `${theme.core.space.space050} solid ${theme.semantic.color.border.primary500}`};
    text-decoration: none;
  }
`

export const Item = styled.div`
  padding-left: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  font-size: 14px;
  line-height: 16.8px;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
`

export const Loading = styled.span`
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
`

export const EmptyMsg = styled.div`
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space250};
  text-align: center;
  font-size: 14px;
  line-height: 16.8px;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
`
