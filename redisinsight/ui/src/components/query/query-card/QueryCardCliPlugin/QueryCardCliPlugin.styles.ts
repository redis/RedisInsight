import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div`
  scrollbar-width: thin;
  flex: auto;
  padding: 9px 20px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 17px;

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

export const PluginIframe = styled.iframe<{ $hidden?: boolean }>`
  width: 100%;

  ${({ $hidden }) =>
    $hidden &&
    css`
      display: none;
    `}
`

export const PluginWrapperResult = styled.div`
  scrollbar-width: thin;
  max-height: 600px;
  overflow: auto;
`

export const AlertIconWrapper = styled.span`
  height: 19px;
  display: inline-flex;
  align-items: center;
`
