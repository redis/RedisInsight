import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div`
  scrollbar-width: thin;
  flex: auto;
  padding: 9px 8px 9px 20px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  position: relative;

  font:
    normal normal normal 14px/17px Inconsolata,
    monospace;
  text-align: left;
  letter-spacing: 0;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};

  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};

  z-index: 6;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

export const Loading = styled.div`
  height: 17px;
  max-width: 600px;

  .euiLoadingContent__singleLine {
    margin-bottom: 0;
  }
`

export const Alert = styled.span`
  font-size: 14px;
  line-height: 17px;
  letter-spacing: -0.13px;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.danger500};
  margin-bottom: 4px;
`

export const AlertIcon = styled.span`
  margin-right: 6px;
  margin-top: -3px;
`
