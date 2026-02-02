import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div`
  height: calc(100% - 34px);
  position: relative;
  width: 100%;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  text-align: left;
  letter-spacing: 0;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};
  z-index: 10;
  overflow: hidden;
`

export const SearchWrapper = styled.div`
  padding: 10px 10px 0 10px;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
`

export const OutputWrapper = styled.div`
  scrollbar-width: thin;
  display: flex;
  flex: 1;
  padding: 0 10px 10px 10px;
  width: 100%;
  min-width: 230px;
  overflow: auto;
  height: 100%;
  max-height: calc(100% - 64px);
`

export const DefaultScreen = styled.div`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  line-height: 21px;
`

export const Summary = styled.span`
  font:
    normal normal normal 13px/18px Graphik,
    sans-serif;
  letter-spacing: -0.13px;
  padding: 10px 0 5px;
`

export const Field = styled.div`
  padding-top: 12px;
  font:
    normal normal normal 13px/17px Graphik,
    sans-serif;
  letter-spacing: -0.13px;
`

export const FieldTitle = styled.span`
  font:
    normal normal 500 14px/17px Graphik,
    sans-serif;
  letter-spacing: -0.14px;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.primary};
  padding-bottom: 3px;
`

export const Arg = styled.div`
  padding: 3px 10px;
  margin: 0 -10px;

  &:nth-child(2n) {
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral100};
  }
`

export const Badge = styled.span`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral300};
  margin-right: 18px;
  min-width: 68px;
  text-align: center;
  padding: 2px 8px;
  border-radius: 4px;
`

export const CommandHelperWrapper = styled.div`
  height: 100%;
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};
  border-left: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};
  border-right: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};
`
