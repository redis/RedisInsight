import React from 'react'

import { KeysBrowser } from 'uiSrc/components/browser'

import {
  Context as KeysBrowserPanelProvider,
  useKeysBrowserPanel,
} from './contexts/Context'
import Header from './components/Header'
import Content from './components/Content'
import Footer from './components/Footer'
import * as S from './KeysBrowserPanel.styles'
import { Props } from '../browser-left-panel/BrowserLeftPanel'

const KeysBrowserPanelInner = () => {
  const { containerRef } = useKeysBrowserPanel()

  return (
    <S.Container ref={containerRef}>
      <KeysBrowser.Compose data-testid="keys-browser-panel">
        <KeysBrowser.Header>
          <Header />
        </KeysBrowser.Header>

        <KeysBrowser.Content>
          <Content />
        </KeysBrowser.Content>

        <KeysBrowser.Footer>
          <Footer />
        </KeysBrowser.Footer>
      </KeysBrowser.Compose>
    </S.Container>
  )
}

const KeysBrowserPanel = (props: Props) => (
  <KeysBrowserPanelProvider {...props}>
    <KeysBrowserPanelInner />
  </KeysBrowserPanelProvider>
)

export default React.memo(KeysBrowserPanel)
