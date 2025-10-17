/* eslint-disable sonarjs/no-nested-template-literals */
import styled, { css } from 'styled-components'
import React, { forwardRef, InputHTMLAttributes } from 'react'
import { Text } from 'uiSrc/components/base/text'

type FilePickerWrapperProps = InputHTMLAttributes<HTMLDivElement> & {
  $large?: boolean
}
export const FilePickerPromptText = styled(Text)``

const largeWrapper = css`
  border-radius: 0;
  overflow: hidden;
  height: auto;
`
const defaultWrapper = css`
  height: 40px;
`
export const FilePickerWrapper = styled.div<FilePickerWrapperProps>`
  max-width: 400px;
  width: 100%;
  position: relative;
  ${({ $large }) => ($large ? largeWrapper : defaultWrapper)}
  &:hover {
    ${FilePickerPromptText} {
      text-decoration: underline;
      font-weight: 600;
    }
    svg {
      scale: 1.2;
    }
  }
`

// Create a base component that forwards refs
const FilePickerInputBase = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <input ref={ref} {...props} />)

// Style the forwarded ref component
export const FilePickerInput = styled(FilePickerInputBase)`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  overflow: hidden;
  &:hover {
    cursor: pointer;
  }
`
const promptLarge = css`
  min-height: ${({ theme }) => theme.core.space.space800};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.core.space.space150};
`
const promptDefault = css`
  height: 140px;
`

const promptPadding = css<FilePickerWrapperProps>`
  padding: ${({ theme, $large }) => {
    const { space100, space400, space250 } = theme.core.space
    return $large
      ? `0 ${space250}`
      : `${space100} ${space100} ${space100} ${space400}`
  }};
`
export const FilePickerPrompt = styled.div<FilePickerWrapperProps>`
  pointer-events: none;
  border-radius: ${({ theme }) => theme.core.space.space050};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  ${promptPadding}

  ${({ $large }) => ($large ? promptLarge : promptDefault)}
  /* Ensure inner buttons are clickable above the FilePickerInput */
  button {
    pointer-events: auto;
    z-index: 1;
  }
`
