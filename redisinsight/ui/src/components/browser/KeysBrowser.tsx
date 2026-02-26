import React from 'react'

import { KeysBrowserSlotProps } from './KeysBrowser.types'
import * as S from './KeysBrowser.styles'

const KeysBrowserCompose = ({
  children,
  className,
  'data-testid': testId,
}: KeysBrowserSlotProps) => (
  <S.Root className={className} data-testid={testId ?? 'keys-browser'}>
    {children}
  </S.Root>
)

const KeysBrowserHeader = ({
  children,
  className,
  'data-testid': testId,
}: KeysBrowserSlotProps) => (
  <S.HeaderContainer
    grow={false}
    className={className}
    data-testid={testId ?? 'keys-browser-header'}
  >
    {children}
  </S.HeaderContainer>
)

const KeysBrowserContent = ({
  children,
  className,
  'data-testid': testId,
}: KeysBrowserSlotProps) => (
  <S.ContentContainer
    className={className}
    data-testid={testId ?? 'keys-browser-content'}
  >
    {children}
  </S.ContentContainer>
)

const KeysBrowserFooter = ({
  children,
  className,
  'data-testid': testId,
}: KeysBrowserSlotProps) => (
  <S.FooterContainer
    align="center"
    grow={false}
    className={className}
    data-testid={testId ?? 'keys-browser-footer'}
  >
    {children}
  </S.FooterContainer>
)

export const KeysBrowser = {
  Compose: KeysBrowserCompose,
  Header: KeysBrowserHeader,
  Content: KeysBrowserContent,
  Footer: KeysBrowserFooter,
}
