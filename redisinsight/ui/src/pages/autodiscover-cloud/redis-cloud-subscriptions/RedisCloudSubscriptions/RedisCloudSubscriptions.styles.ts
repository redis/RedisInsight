import styled from 'styled-components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'
import { Group, Item } from 'uiSrc/components/base/layout/list'
import { ColorText } from 'uiSrc/components/base/text'

export const AccountItem = styled(FlexItem).attrs({
  grow: false,
  direction: 'row',
})`
  align-items: center;
  gap: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  &:not(:last-child):after {
    content: '';
    margin-left: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
    border-right: 1px solid
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
    height: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  }
`

export const AccountItemTitle = styled(ColorText).attrs({
  size: 'M',
})`
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  text-wrap: nowrap;
`
export const AccountWrapper = styled(Row).attrs({
  justify: 'start',
  gap: 'l',
  align: 'center',
})`
  align-self: stretch;
  width: 100%;
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  min-height: 44px;
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
`

export const AlertStatusDot = styled.span`
  &::before {
    font-size: 8px;
    padding: 0 14px;
    content: ' \\25CF';
    vertical-align: middle;
  }
`

export const AlertStatusListItem = styled(Item)`
  line-height: 20px;
`
export const AlertStatusList = styled(Group)`
  opacity: 0.85;
  padding-bottom: 5px;
  padding-top: 10px;
`
