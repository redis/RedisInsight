import styled from 'styled-components'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { Text, Title } from 'uiSrc/components/base/text'
import { Theme } from 'uiSrc/components/base/theme/types'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'

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
  height: auto;
  scrollbar-width: thin;
  //overflow: auto;
  padding: 1px 1px 75px;
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
