import styled from 'styled-components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { ColorText } from 'uiSrc/components/base/text'
import { Theme } from 'uiSrc/components/base/theme/types'

export const AccountItemTitle = styled(ColorText).attrs({
  size: 'XS',
  color: 'secondary',
})`
  text-wrap: nowrap;
`

export const AccountItem = styled(FlexItem).attrs({
  grow: false,
  direction: 'row',
  padding: 3,
})`
  align-items: center;
`
export const AccountWrapper = styled(Row).attrs({
  justify: 'start',
  gap: 'xxl',
  align: 'center',
})`
  width: 100%;
  min-height: 44px;
  padding-left: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  background-color: ${({ theme }: { theme: Theme }) =>
  theme.semantic.color.background.neutral500};
`

export const Footer = styled(FlexItem)`
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
`
