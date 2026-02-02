import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled.div<{ $disabled?: boolean }>`
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

  .inlineMonacoEditor {
    height: 192px;
    width: 100%;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: -0.14px;
    margin-bottom: 2px;
  }

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

export const IsEditing = styled.div`
  padding-bottom: 40px;
`

export const EditBtn = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 30px;
  min-width: 0;
  height: 30px;
  border-radius: 100%;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`
