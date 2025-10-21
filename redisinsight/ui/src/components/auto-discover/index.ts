import styled from 'styled-components'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { Text, Title } from 'uiSrc/components/base/text'
import { Theme } from 'uiSrc/components/base/theme/types'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { PaddingType } from 'uiSrc/components/base/layout/flex/flex.styles'

export const PageTitle = styled(Title).attrs({
  size: 'M',
})`
  padding-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
`
export const PageSubTitle = styled(Text).attrs({
  size: 'S',
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
export const Footer = styled(FlexItem).attrs<{
  grow?: boolean | number
  padding?: PaddingType
}>(({ grow, padding }) => ({
  grow: grow ?? false,
  padding: padding ?? 6,
}))`
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
`

export const DatabaseContainer = styled(Col)`
  position: relative;
  padding: 20px 14px 0 14px;
  @media only screen and (min-width: 768px) {
    padding: 30px 14px 0 30px;
    max-width: calc(100vw - 95px);
  }
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
  max-width: 100%;
  display: inline-block;
  width: auto;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  vertical-align: top;
`
export const CopyBtn = styled(IconButton).attrs({
  icon: CopyIcon,
  size: 'L',
})`
  margin-left: 15px;
  opacity: 0;
  height: 0;
  transition: opacity 0.25s ease-in-out;
`

export const CopyTextContainer = styled.div`
  height: 24px;
  line-height: 24px;
  width: auto;
  max-width: 100%;
  padding-right: 34px;
  position: relative;
  * {
  }

  &:hover ${CopyBtn} {
    opacity: 1;
    height: auto;
  }
`
