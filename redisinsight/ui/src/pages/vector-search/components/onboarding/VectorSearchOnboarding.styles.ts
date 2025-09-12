import styled from 'styled-components'
import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'
import Eyeglass from 'uiSrc/assets/img/vector-search/Eyeglass.svg'
import EyeglassDark from 'uiSrc/assets/img/vector-search/EyeglassDark.svg'

export const StyledVectorSearchOnboarding = styled(FlexGroup)`
  width: 100%;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral200};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  padding: ${({ theme }) => theme.core.space.space200};
`

export const DismissAction = styled(FlexItem)`
  align-self: flex-end;
  margin-bottom: auto;
  z-index: 1;
`

export const Content = styled(FlexGroup)`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`

export const HeaderContainer = styled(FlexGroup)`
  z-index: 1;
`

export const MagnifierImage = styled.img`
  position: absolute;
  bottom: -1px;
  left: 7px;
  pointer-events: none;
  z-index: 0;
  content: url(${({ theme }) =>
    theme.name === 'dark' ? EyeglassDark : Eyeglass});
`

export const StyledActions = styled(FlexGroup)`
  z-index: 1;
  margin-top: ${({ theme }) => theme.core.space.space300};
`
