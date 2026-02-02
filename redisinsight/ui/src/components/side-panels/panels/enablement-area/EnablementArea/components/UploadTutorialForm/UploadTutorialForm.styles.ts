import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled.div``

export const Input = styled.span`
  height: 34px;
  background: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
`

export const UploadFileWrapper = styled.div`
  text-align: right;
  margin-top: -8px;
`

export const UploadFileName = styled.div`
  display: flex;
  align-items: center;
  padding-left: 4px;
`

export const UploadFileNameTitle = styled.span`
  max-width: calc(100% - 30px);
`

export const BtnSubmit = styled.span`
  svg {
    width: 16px;
    height: 16px;
    margin-top: 0;
  }
`

export const FileDrop = styled.div`
  width: 100%;
  margin-top: 14px;

  .RI-File-Picker__prompt {
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral100};
    height: 120px;
    border-radius: 4px;
    box-shadow: none;
    border: 1px dashed
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  }

  .RI-File-Picker__clearButton {
    margin-top: 4px;
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.primary500};
    text-transform: lowercase;
  }
`

export const Hr = styled.div`
  margin: 12px 0;
  width: 100%;
  text-align: center;
  position: relative;

  &:before,
  &:after {
    content: '';
    display: block;
    width: 40%;
    height: 1px;
    background: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.border.neutral500};
    position: absolute;
    top: 50%;
  }

  &:before {
    left: 0;
  }

  &:after {
    right: 0;
  }
`

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
