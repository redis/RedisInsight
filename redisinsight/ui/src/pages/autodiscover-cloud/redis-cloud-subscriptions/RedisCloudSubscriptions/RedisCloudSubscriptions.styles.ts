import styled from 'styled-components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { ColorText, Text, Title } from 'uiSrc/components/base/text'
import { Theme } from 'uiSrc/components/base/theme/types'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { Group, Item } from 'uiSrc/components/base/layout/list'
import { FormField } from 'uiSrc/components/base/forms/FormField'

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
  border-radius: 0.8rem;
  min-height: 44px;
  padding-left: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral500};
`
export const PageTitle = styled(Title).attrs({
  size: 'M',
})`
  padding-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
`

export const PageSubTitle = styled(Text).attrs({
  size: 'S',
  color: 'subdued',
  component: 'span',
})`
  padding-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
`

export const SearchContainer = styled(FlexItem)`
  max-width: 100%;
  padding-top: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
`

export const SearchForm = styled(FormField)`
  width: 266px;
`

export const Footer = styled(FlexItem)`
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
`

export const DatabaseWrapper = styled.div`
  padding: 1px;
  height: auto;
  scrollbar-width: thin;
  //overflow: auto;
  position: relative;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  flex-grow: 1;
  overflow: hidden;

  .column_status {
    text-transform: capitalize;
  }
`

export const SelectAllCheckbox = styled(Checkbox)`
  & svg {
    margin: 0 !important;
  }
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

export const CellText = styled(Text).attrs({
  size: 'S',
  component: 'span',
})``

export const CopyPublicEndpointText = styled(CellText)`
  max-width: calc(100% - 50px);
  display: inline-block;
  width: auto;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  vertical-align: top;
`

export const CopyTextContainer = styled.div`
  height: 24px;
  line-height: 24px;
  width: auto;
  max-width: 100%;
  padding-right: 34px;
  position: relative;
  * {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.primary500};
  }

  &:hover .copyHostPortBtn,
  &:hover .copyUrlBtn,
  &:hover .copyPublicEndpointBtn {
    opacity: 1;
    height: auto;
  }
`
