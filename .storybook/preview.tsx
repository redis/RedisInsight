import React from 'react'
import type { Parameters, Preview } from '@storybook/react-vite'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { CommonStyles, themesDefault, themesRebrand } from '@redis-ui/styles'
import 'modern-normalize/modern-normalize.css'
import '@redis-ui/styles/normalized-styles.css'
import '@redis-ui/styles/fonts.css'
import 'uiSrc/pages/home/styles.scss'
import { RootStoryLayout } from './RootStoryLayout'
import { StoryContextProvider } from './Story.context'
import { useStoryContext } from 'storybook/internal/preview-api'
import { TooltipProvider } from '@redis-ui/components'
import { Provider } from 'react-redux'
import { store } from 'uiSrc/slices/store'
import Router from 'uiSrc/Router'
import { StyledContainer } from './helpers/styles'
import { GlobalStyles } from 'uiSrc/styles/globalStyles'

const parameters: Parameters = {
  parameters: {
    layout: 'centered',
  },
  actions: { argTypesRegex: '^on.*' },
  controls: {
    disableSaveFromUI: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    expanded: true,
    sort: 'requiredFirst',
    exclude: ['theme'],
  },
  docs: {
    toc: true,
    controls: {
      sort: 'requiredFirst',
    },
  },
  options: {
    storySort: {
      method: 'alphabetical',
      order: ['Getting Started', 'Playground', '*'],
    },
  },
}

const preview: Preview = {
  parameters,
  decorators: [
    (Story) => (
      <StoryContextProvider value={useStoryContext()}>
        <Router>
          <Provider store={store}>
            <TooltipProvider>
              <RootStoryLayout storyContext={useStoryContext()}>
                <CommonStyles />
                <GlobalStyles />
                <StyledContainer>
                  <Story />
                </StyledContainer>
              </RootStoryLayout>
            </TooltipProvider>
          </Provider>
        </Router>
      </StoryContextProvider>
    ),
    withThemeFromJSXProvider({
      themes: {
        light: themesDefault.light,
        dark: themesDefault.dark,
        'light-rebrand': themesRebrand.light,
        'dark-rebrand': themesRebrand.dark,
      },
      defaultTheme: 'light',
      Provider: StyledThemeProvider,
    }),
  ],
}

export default preview
