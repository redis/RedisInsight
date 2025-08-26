import styled from 'styled-components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'
import { Group, Item } from 'uiSrc/components/base/layout/list'
import { ColorText } from 'uiSrc/components/base/text'

export const AccountItem = styled(FlexItem).attrs({
  grow: false,
  direction: 'row',
  padding: 3,
})`
  align-items: center;
`

export const AccountItemTitle = styled(ColorText).attrs({
  size: 'XS',
  color: 'secondary',
})`
  text-wrap: nowrap;
`
export const AccountWrapper = styled(Row).attrs({
  justify: 'start',
  gap: 'xxl',
  align: 'center',
})`
  width: 100%;
  border-radius: 0.8rem;
  min-height: 44px;
  padding-left: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral500};
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
