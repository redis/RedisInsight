import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

// Cli/Cli.tsx
export const CliContainer = styled.div`
  height: 100%;
  width: 100%;
  min-width: 230px;
`

export const CliMain = styled.div`
  scrollbar-width: thin;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  position: relative;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  border-left: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
  border-right: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral400};
`

// CliBodyWrapper / CliBody
export const Section = styled.section`
  position: absolute;
  width: 100%;
  height: calc(100% - 34px);
  display: flex;
`

export const Output = styled.div`
  white-space: pre-wrap;
`

export const Input = styled.div`
  padding-bottom: 7px;
`

// CliInput
export const Command = styled.span`
  font: normal normal bold 14px/15px Inconsolata;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  caret-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary600};
  min-width: 5px;
  display: inline;
`

// CliAutocomplete
export const AutocompleteContainer = styled.span`
  font: normal normal normal 13px/15px Inconsolata;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral400};
  opacity: 0.8;
  margin-left: 1px;
`

export const Params = styled.span`
  padding: 0 5px;
`
