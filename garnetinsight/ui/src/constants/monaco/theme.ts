import { monaco } from 'react-monaco-editor'

export const redisearchDarKThemeRules = [
  { token: 'keyword', foreground: '#C8B5F2' },
  { token: 'argument.block.0', foreground: '#8CD7B9' },
  { token: 'argument.block.1', foreground: '#72B59B' },
  { token: 'argument.block.2', foreground: '#3A8365' },
  { token: 'argument.block.3', foreground: '#244F3E' },
  { token: 'argument.block.withToken.0', foreground: '#8CD7B9' },
  { token: 'argument.block.withToken.1', foreground: '#72B59B' },
  { token: 'argument.block.withToken.2', foreground: '#3A8365' },
  { token: 'argument.block.withToken.3', foreground: '#244F3E' },
  { token: 'index', foreground: '#DE47BB' },
  { token: 'query', foreground: '#7B90E0' },
  { token: 'field', foreground: '#B02C30' },
  { token: 'query.operator', foreground: '#B9F0F3' },
  { token: 'function', foreground: '#9E7EE8' },
]

export const redisearchLightThemeRules = [
  { token: 'keyword', foreground: '#7547DE' },
  { token: 'argument.block.0', foreground: '#8CD7B9' },
  { token: 'argument.block.1', foreground: '#72B59B' },
  { token: 'argument.block.2', foreground: '#3A8365' },
  { token: 'argument.block.3', foreground: '#244F3E' },
  { token: 'argument.block.withToken.0', foreground: '#8CD7B9' },
  { token: 'argument.block.withToken.1', foreground: '#72B59B' },
  { token: 'argument.block.withToken.2', foreground: '#3A8365' },
  { token: 'argument.block.withToken.3', foreground: '#244F3E' },
  { token: 'index', foreground: '#DE47BB' },
  { token: 'query', foreground: '#7B90E0' },
  { token: 'field', foreground: '#B02C30' },
  { token: 'query.operator', foreground: '#B9F0F3' },
  { token: 'function', foreground: '#9E7EE8' },
]

export const darkThemeRules = [
  { token: 'function', foreground: 'BFBC4E' },
  ...redisearchDarKThemeRules.map((rule) => ({
    ...rule,
  })),
]

export const lightThemeRules = [
  { token: 'function', foreground: '795E26' },
  ...redisearchLightThemeRules.map((rule) => ({
    ...rule,
  })),
]

export enum MonacoThemes {
  Dark = 'dark',
  Light = 'light',
}

export const darkTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: darkThemeRules,
  colors: {},
}

export const lightTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: lightThemeRules,
  colors: {},
}
