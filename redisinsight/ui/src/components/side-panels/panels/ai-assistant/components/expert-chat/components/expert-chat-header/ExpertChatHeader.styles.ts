import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Header = styled.div`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
`

export const DbName = styled.span`
  overflow: hidden;
  margin-right: 16px;

  .euiText {
    font-weight: 500;
  }
`

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
`

export const HeaderBtn = styled.span`
  width: 24px;

  &:disabled {
    opacity: 0.5;
  }
`

export const HeaderBtnAnchor = styled.span`
  margin-left: 4px;
`

export const POPOVER_MIN_WIDTH = '300px'

export const PopoverAnchor = styled.span``

export const OpenTutorialsBtn = styled.span`
  display: block;
  margin-left: auto;
`
