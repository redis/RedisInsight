import styled from 'styled-components'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { Text, Title } from 'uiSrc/components/base/text'
import { Theme } from 'uiSrc/components/base/theme/types'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'

export const PageTitle = styled(Title).attrs({
  size: 'L',
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
  padding?: React.ComponentProps<typeof FlexItem>['padding']
}>(({ grow, padding }) => ({
  grow: grow ?? false,
  padding: padding ?? 6,
}))`
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
`

export const DatabaseContainer = styled(Col)`
  position: relative;
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space250} ${theme.core.space.space200} 0 ${theme.core.space.space200}`};
  @media only screen and (min-width: 768px) {
    padding: ${({ theme }: { theme: Theme }) =>
      `${theme.core.space.space400} ${theme.core.space.space200} 0 ${theme.core.space.space400}`};
    max-width: calc(100vw - 95px);
  }
`

export const DatabaseWrapper = styled.div`
  height: auto;
  scrollbar-width: thin;
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space010};
  position: relative;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  overflow: hidden;
`
export const SelectAllCheckbox = styled(Checkbox)`
  & svg {
    margin: 0 !important;
  }
`
export const CellText = styled(Text).attrs({
  size: 'M',
  component: 'span',
})`
  max-width: 100%;
  display: inline-block;
  width: auto;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

export const CopyPublicEndpointText = styled(CellText)`
  vertical-align: top;
`

export const StatusColumnText = styled(CellText)`
  text-transform: capitalize;
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
