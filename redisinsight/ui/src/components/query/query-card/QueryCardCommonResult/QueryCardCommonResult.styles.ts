import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div`
  scrollbar-width: thin;
  flex: auto;
  padding: 9px 20px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;

  font:
    normal normal normal 14px/17px Inconsolata,
    monospace;
  text-align: left;
  letter-spacing: 0;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};

  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};

  z-index: 6;
`

export const Loading = styled.div`
  height: 17px;
  max-width: 600px;

  .euiLoadingContent__singleLine {
    margin-bottom: 0;
  }
`
