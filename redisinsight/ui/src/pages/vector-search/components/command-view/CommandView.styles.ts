import styled from 'styled-components'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export const EditorWrapper = styled(FlexGroup)`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  padding-top: ${({ theme }) => theme.core?.space.space300};

  /*
   * Override Monaco CSS variables so the editor blends with the parent card.
   * The global _monaco.scss applies "background-color: var(--monacoBgColor) !important"
   * so redefining the variable here is the cleanest override.
   */
  --monacoBgColor: transparent;

  /*
   * Monaco injects --vscode-focusBorder directly on .monaco-editor via its
   * theme stylesheet, so a parent-level override is ignored. We must target
   * the .monaco-editor element itself to win the specificity battle.
   */
  .monaco-editor {
    --vscode-focusBorder: transparent;
  }
`

export const CopyButtonWrapper = styled(FlexGroup)`
  position: absolute;
  top: ${({ theme }) => theme.core.space.space300};
  right: ${({ theme }) => theme.core.space.space300};
  z-index: 10;
`
