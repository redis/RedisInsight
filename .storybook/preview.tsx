import React from 'react'
import type { Parameters, Preview } from '@storybook/react-vite'
import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import {
  createGlobalStyle,
  ThemeProvider as StyledThemeProvider,
} from 'styled-components'
import { CommonStyles, themeDark, themeLight, themeOld } from '@redis-ui/styles'
import 'modern-normalize/modern-normalize.css'
import '@redis-ui/styles/normalized-styles.css'
import '@redis-ui/styles/fonts.css'
import { RootStoryLayout } from './RootStoryLayout'
import { StoryContextProvider } from './Story.context'
import { useStoryContext } from 'storybook/internal/preview-api'
import { TooltipProvider } from '@redis-ui/components'
import { type Theme } from 'uiSrc/components/base/theme/types'
// import { store } from 'uiSrc/utils/test-utils'
import { Provider } from 'react-redux'
import { store } from 'uiSrc/slices/store'

const parameters: Parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
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
      order: ['Getting Started', '*'],
    },
  },
}

const GlobalStoryStyles = createGlobalStyle`
  .sb-show-main, .docs-story {
    background: ${({ theme }: { theme: Theme }) => theme.globals.body.bgColor};
    color: ${({ theme }: { theme: Theme }) => theme.globals.body.textColor};
  }
`

const preview: Preview = {
  parameters,
  decorators: [
    (Story) => (
      <StoryContextProvider value={useStoryContext()}>
        <Provider store={store}>
          <TooltipProvider>
            <RootStoryLayout storyContext={useStoryContext()}>
              <CommonStyles />
              <Story />
            </RootStoryLayout>
          </TooltipProvider>
        </Provider>
      </StoryContextProvider>
    ),
    withThemeFromJSXProvider({
      themes: {
        light: themeLight,
        dark: themeDark,
        obsolete: themeOld,
      },
      defaultTheme: 'light',
      Provider: StyledThemeProvider,
      GlobalStyles: GlobalStoryStyles,
    }),
  ],
}

export default preview
