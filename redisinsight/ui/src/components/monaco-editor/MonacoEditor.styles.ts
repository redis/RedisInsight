import { type ComponentPropsWithRef, type HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled.div<
  HTMLAttributes<HTMLDivElement> & {
    $disabled?: boolean
    $isEditing?: boolean
  }
>`
  position: relative;
  height: 200px;
  max-width: 100%;
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};

  ${({ $disabled }) =>
    $disabled &&
    css`
      pointer-events: none;
      opacity: 0.5;
    `}

  ${({ $isEditing }) =>
    $isEditing &&
    css`
      padding-bottom: 40px;
    `}

  .monaco-editor,
  .monaco-editor .margin,
  .monaco-editor .minimap-decorations-layer,
  .monaco-editor-background {
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral100};
  }

  .monaco-editor .hover-row.status-bar {
    display: none;
  }
`

export const EditorWrapper = styled.div<ComponentPropsWithRef<'div'>>`
  height: 192px;
  width: 100%;
  font-size: 14px;
  line-height: 24px;
  letter-spacing: -0.14px;
  margin-bottom: 2px;
`

export const EditBtnWrapper = styled.span<HTMLAttributes<HTMLSpanElement>>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  right: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  width: 30px;
  min-width: 0;
  height: 30px;
  border-radius: 100%;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`
