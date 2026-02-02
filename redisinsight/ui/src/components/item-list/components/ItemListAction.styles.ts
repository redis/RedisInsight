import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const PopoverSubTitle = styled.span`
  width: 372px;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral600};
  line-height: 1.3;
  font-size: 14px;
`

export const NameList = styled(Row)`
  &:not(:last-child) {
    padding-bottom: 7px;
  }
`

export const NameListText = styled.span`
  line-height: 22px;
`

export const BoxSection = styled.div`
  scrollbar-width: thin;

  width: 400px;
  max-height: 189px;
  overflow-y: scroll;

  padding: 13px 15px;
  margin-top: 10px;

  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral600};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};

  svg {
    color: ${({ theme }: { theme: Theme }) =>
      theme.components.typography.colors.primary};
    width: 22px;
    height: 22px;
  }
`

export const PopoverFooter = styled.div`
  text-align: right;
  margin-top: 24px;

  span {
    font-size: 13px;
  }
`

export const ActionBtn = styled.span`
  min-width: 93px;

  &:focus {
    text-decoration: none;
  }
`

export const PopoverDeleteBtn = styled.span``
