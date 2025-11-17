import styled from 'styled-components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'
import { ColorText } from 'uiSrc/components/base/text'

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
  white-space: nowrap;
`

export const LoadingWrapper = styled.div`
  width: 80px;
  height: 15px;
`
