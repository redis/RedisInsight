import { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { monaco } from 'react-monaco-editor'
import { findIndex } from 'lodash'
import { appRedisCommandsSelector } from 'uiSrc/slices/app/redis-commands'
import {
  MonacoLanguage,
  redisLanguageConfig,
  Theme,
  IRedisCommandTree,
} from 'uiSrc/constants'
import { getRedisMonarchTokensProvider } from 'uiSrc/utils'
import { darkTheme, lightTheme, MonacoThemes } from 'uiSrc/constants/monaco'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import { getRediSearchSubRedisMonarchTokensProvider } from 'uiSrc/utils/monaco/monarchTokens/redisearchTokensSubRedis'
import SEARCH_COMMANDS_SPEC from 'uiSrc/pages/workbench/data/supported_commands.json'
import { mergeRedisCommandsSpecs } from 'uiSrc/utils/transformers/redisCommands'
import { ModuleCommandPrefix } from 'uiSrc/pages/workbench/constants'

const MonacoLanguages = () => {
  const { theme } = useContext(ThemeContext)
  const { commandsArray: REDIS_COMMANDS_ARRAY, spec: COMMANDS_SPEC } =
    useSelector(appRedisCommandsSelector)

  useEffect(() => {
    if (monaco?.editor) {
      monaco.editor.defineTheme(MonacoThemes.Dark, darkTheme)
      monaco.editor.defineTheme(MonacoThemes.Light, lightTheme)
    }
  }, [])

  useEffect(() => {
    monaco.editor.setTheme(
      theme === Theme.Dark ? MonacoThemes.Dark : MonacoThemes.Light,
    )
  }, [theme])

  useEffect(() => {
    if (!REDIS_COMMANDS_ARRAY.length) return

    setupMonacoRedisLang()
  }, [REDIS_COMMANDS_ARRAY])

  const setupMonacoRedisLang = () => {
    const languages = monaco.languages.getLanguages()
    const isRedisLangRegistered =
      findIndex(languages, { id: MonacoLanguage.Redis }) > -1
    if (!isRedisLangRegistered) {
      monaco.languages.register({ id: MonacoLanguage.Redis })
      monaco.languages.register({ id: MonacoLanguage.RediSearch })
    }

    monaco.languages.setLanguageConfiguration(
      MonacoLanguage.Redis,
      redisLanguageConfig,
    )
    monaco.languages.setLanguageConfiguration(
      MonacoLanguage.RediSearch,
      redisLanguageConfig,
    )
    const REDIS_COMMANDS = mergeRedisCommandsSpecs(
      COMMANDS_SPEC,
      SEARCH_COMMANDS_SPEC,
    ) as IRedisCommandTree[]
    const REDIS_SEARCH_COMMANDS = REDIS_COMMANDS.filter(({ name }) =>
      name?.startsWith(ModuleCommandPrefix.RediSearch),
    )

    try {
      monaco.languages.setMonarchTokensProvider(
        MonacoLanguage.RediSearch,
        getRediSearchSubRedisMonarchTokensProvider(REDIS_SEARCH_COMMANDS),
      )
    } catch (exception) {
      console.error('Monaco RediSearch language setup error: ', exception)
    }

    try {
      monaco.languages.setMonarchTokensProvider(
        MonacoLanguage.Redis,
        getRedisMonarchTokensProvider(REDIS_COMMANDS),
      )
    } catch (exception) {
      console.error('Monaco Redis language setup error: ', exception)
    }
  }

  return null
}

export default MonacoLanguages
