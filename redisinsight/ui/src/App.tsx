import React, { ReactElement, useEffect } from 'react'
import { Provider, useSelector } from 'react-redux'

import { Route, Switch } from 'react-router-dom'
import { store } from 'uiSrc/slices/store'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { removePagePlaceholder } from 'uiSrc/utils'
import MonacoLanguages from 'uiSrc/components/monaco-laguages'
import AppInit from 'uiSrc/components/init/AppInit'
import { Page, PageBody } from 'uiSrc/components/base/layout/page'
import { Pages, Theme } from './constants'
import { themeService } from './services'
import {
  Config,
  GlobalSubscriptions,
  NavigationMenu,
  Notifications,
  ShortcutsFlyout,
} from './components'
import { ThemeProvider } from './contexts/themeContext'
import MainComponent from './components/main/MainComponent'
import MonacoEnvironmentInitializer from './components/MonacoEnvironmentInitializer/MonacoEnvironmentInitializer'
import GlobalDialogs from './components/global-dialogs'
import NotFoundErrorPage from './pages/not-found-error/NotFoundErrorPage'

import themeDark from './styles/themes/dark_theme/darkTheme.scss?inline'
import themeLight from './styles/themes/light_theme/lightTheme.scss?inline'

import './styles/elastic.css'
import './App.scss'

themeService.registerTheme(Theme.Dark, themeDark)
themeService.registerTheme(Theme.Light, themeLight)

const AppWrapper = ({ children }: { children?: ReactElement[] }) => (
  <Provider store={store}>
    <ThemeProvider>
      <AppInit>
        <App>{children}</App>
      </AppInit>
    </ThemeProvider>
  </Provider>
)
const App = ({ children }: { children?: ReactElement[] }) => {
  const { loading: serverLoading } = useSelector(appInfoSelector)
  useEffect(() => {
    if (!serverLoading) {
      removePagePlaceholder()
    }
  }, [serverLoading])
  return (
    <div className="main-container">
      <MonacoEnvironmentInitializer />
      <Switch>
        <Route exact path={Pages.notFound} component={NotFoundErrorPage} />
        <Route
          path="*"
          render={() => (
            <>
              <Page className="main">
                <GlobalDialogs />
                <GlobalSubscriptions />
                <NavigationMenu />
                <PageBody component="main">
                  <MainComponent />
                </PageBody>
              </Page>
              <Notifications />
              <Config />
              <ShortcutsFlyout />
              <MonacoLanguages />
              {children}
            </>
          )}
        />
      </Switch>
    </div>
  )
}
export default AppWrapper
