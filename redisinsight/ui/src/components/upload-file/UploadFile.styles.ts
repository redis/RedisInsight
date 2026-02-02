import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const FileDrop = styled.input`
  display: none;
`

export const UploadBtn = styled.label`
  display: flex;
  cursor: pointer;
  padding: 4px 12px;
`

export const EmptyBtn = styled.span`
  &.euiButtonEmpty {
    height: 22px;
    margin-top: 7px;

    .euiButtonEmpty__content {
      padding: 0;
    }
  }
`

export const Icon = styled.span`
  width: 14px;
  height: 14px;
  margin: 2px 4px 0 0;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral600};
`

export const Label = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral600};
  line-height: 16px;
  font-weight: 400;
  font-size: 12px;
`
