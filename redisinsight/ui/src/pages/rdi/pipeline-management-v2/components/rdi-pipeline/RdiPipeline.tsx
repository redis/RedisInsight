import React, { useMemo } from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { themes as rdiUiThemes } from '@redis-ui/styles-rdi'
import { PipelineManagement } from '@rdi-ui/pipeline'
import { Pages } from 'uiSrc/constants'
import { Theme } from 'uiSrc/constants/themes'
import { getBaseUrl } from 'uiSrc/services/apiService'
import { useThemeContext } from 'uiSrc/contexts/themeContext'
import { useRdiPipelineNavigation } from '../../hooks/useRdiPipelineNavigation'

export interface Props {
  rdiInstanceId: string
}

const RdiPipeline = ({ rdiInstanceId }: Props) => {
  const navigation = useRdiPipelineNavigation()
  const { theme } = useThemeContext()

  /**
   * @rdi-ui/pipeline bundles its own @redis-ui/components but reads the theme
   * from the host's styled-components context, so the two have to agree on
   * the theme's shape. RedisInsight is on @redis-ui/styles 15, whose
   * `components.layouts` is `{ flexGroup, flexDivider }`, while the bundled
   * components expect the styles 21+ shape (`{ gap, padding, margin, ... }`)
   * and crash reading `layouts.gap.S`.
   *
   * Until RedisInsight upgrades @redis-ui/* wholesale, override the theme for
   * this subtree only, using an aliased styles 21 install
   * (@redis-ui/styles-rdi). The rest of the app keeps the version 15 theme.
   */
  const rdiUiTheme = useMemo(
    () => (theme === Theme.Dark ? rdiUiThemes.dark : rdiUiThemes.light),
    [theme],
  )

  return (
    <StyledThemeProvider theme={rdiUiTheme}>
      <PipelineManagement
        basePath={Pages.rdiPipelineManagementV2(rdiInstanceId)}
        navigation={navigation}
        rdiClient={{
          baseUrl: `${getBaseUrl()}rdi/${rdiInstanceId}/proxy`,
          withCredentials: true,
        }}
        targetDatabase={{ strategy: 'manual' }}
        sourceSecrets={{ strategy: 'credentials' }}
        multiSource={{}}
        pipelineSecrets={{ mountSecrets: async () => {} }}
        configTranslate={{
          // native-config <-> draft translation isn't wired up yet - these
          // stubs only satisfy the required shape so the component renders
          translateDraftToNativeConfig: async () => ({ jobs: [] }),
          translateNativeConfigToDraft: async () => ({}),
        }}
      />
    </StyledThemeProvider>
  )
}

export default RdiPipeline
