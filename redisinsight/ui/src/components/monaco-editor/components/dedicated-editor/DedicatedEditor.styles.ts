import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Rnd = styled.div`
  width: 100%;
  z-index: 100;
`

export const Container = styled.div`
  height: 100%;
  word-break: break-word;
  text-align: left;
  letter-spacing: 0;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.primary500};
  border-radius: 4px;
  padding-left: 6px;
  padding-right: 6px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`

export const Input = styled.div`
  height: calc(100% - 46px);
  width: 100%;
`

export const Actions = styled.div`
  height: 26px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 6px;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  border-radius: 0 0 4px 4px;
  justify-content: space-between;
`

export const DeclineBtn = styled.span`
  &:hover span {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.danger500};
  }
`

export const ApplyBtn = styled.span`
  margin-left: 6px;

  &:hover span {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.primary500};
  }
`
