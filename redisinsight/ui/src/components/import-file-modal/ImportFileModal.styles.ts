import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Result = styled.div`
  height: fit-content;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 20px;
`

export const ErrorFileMsg = styled.div`
  margin-top: 10px;
  font-size: 12px;
`

export const FileDrop = styled.div`
  width: 300px;
  margin: auto;

  .RI-File-Picker__showDrop .RI-File-Picker__prompt,
  .RI-File-Picker__input:focus + .RI-File-Picker__prompt {
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral100};
  }

  .RI-File-Picker__prompt {
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral100};
    height: 140px;
    border-radius: 4px;
    box-shadow: none;
    border: 1px dashed
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
    color: ${({ theme }: { theme: Theme }) =>
      theme.components.typography.colors.primary};
  }

  .RI-File-Picker {
    width: 400px;
  }

  .RI-File-Picker__clearButton {
    margin-top: 4px;
  }
`

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 20px;
`
