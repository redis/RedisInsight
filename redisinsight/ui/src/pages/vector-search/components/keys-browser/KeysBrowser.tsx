import React from 'react'

import { KeysBrowser as KeysBrowserLayout } from 'uiSrc/components/browser'

import { Provider } from './contexts/Context'
import Header from './components/Header'
import Content from './components/Content'
import Footer from './components/Footer'
import { KeysBrowserProps } from './KeysBrowser.types'
import * as S from './KeysBrowser.styles'

const KeysBrowserInner = () => (
  <S.Container>
    <KeysBrowserLayout.Compose data-testid="vs-keys-browser">
      <Header />

      <KeysBrowserLayout.Content>
        <Content />
      </KeysBrowserLayout.Content>

      <Footer />
    </KeysBrowserLayout.Compose>
  </S.Container>
)

const KeysBrowser = (props: KeysBrowserProps) => (
  <Provider {...props}>
    <KeysBrowserInner />
  </Provider>
)

export default KeysBrowser
