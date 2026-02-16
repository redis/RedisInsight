import React from 'react'

import {
  KeysBrowserRoot,
  KeysBrowserHeaderContainer,
  KeysBrowserContentContainer,
  KeysBrowserFooterContainer,
} from './KeysBrowser.styles'

export interface KeysBrowserSlotProps {
  children?: React.ReactNode
  className?: string
  'data-testid'?: string
}

const KeysBrowserCompose = ({
  children,
  className,
  'data-testid': testId,
}: KeysBrowserSlotProps) => (
  <KeysBrowserRoot className={className} data-testid={testId ?? 'keys-browser'}>
    {children}
  </KeysBrowserRoot>
)

const KeysBrowserHeader = ({
  children,
  className,
  'data-testid': testId,
}: KeysBrowserSlotProps) => (
  <KeysBrowserHeaderContainer
    className={className}
    data-testid={testId ?? 'keys-browser-header'}
  >
    {children}
  </KeysBrowserHeaderContainer>
)

const KeysBrowserContent = ({
  children,
  className,
  'data-testid': testId,
}: KeysBrowserSlotProps) => (
  <KeysBrowserContentContainer
    className={className}
    data-testid={testId ?? 'keys-browser-content'}
  >
    {children}
  </KeysBrowserContentContainer>
)

const KeysBrowserFooter = ({
  children,
  className,
  'data-testid': testId,
}: KeysBrowserSlotProps) => (
  <KeysBrowserFooterContainer
    className={className}
    data-testid={testId ?? 'keys-browser-footer'}
  >
    {children}
  </KeysBrowserFooterContainer>
)

export const KeysBrowser = {
  Compose: KeysBrowserCompose,
  Header: KeysBrowserHeader,
  Content: KeysBrowserContent,
  Footer: KeysBrowserFooter,
}
