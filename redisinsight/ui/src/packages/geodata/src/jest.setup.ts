import '@testing-library/jest-dom'

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Geodata components now use styled-components that read theme tokens
// (e.g. theme.core.space.space150). Wrap every testing-library render in a
// styled-components ThemeProvider so those tokens resolve during tests.
jest.mock('@testing-library/react', () => {
  const actual = jest.requireActual('@testing-library/react')
  const React = require('react')
  const { ThemeProvider } = require('styled-components')
  const { themesDefault } = require('@redis-ui/styles')

  const ThemedWrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(
      ThemeProvider,
      { theme: themesDefault.dark },
      children,
    )

  return {
    ...actual,
    render: (ui: React.ReactElement, options: Record<string, unknown> = {}) =>
      actual.render(ui, { wrapper: ThemedWrapper, ...options }),
  }
})
