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
          // Deliberately no `withCredentials`: the API's CORS setup
          // (app.enableCors() with no options, in main.ts) answers with
          // Access-Control-Allow-Origin: *, which browsers reject for a
          // credentialed (cross-origin, cookie-carrying) request. The proxy
          // authenticates to the RDI instance server-side, so the browser has
          // no cookie to send here anyway. Turning this on would also require
          // enableCors() to know the exact origin RedisInsight is served
          // from, which isn't knowable ahead of time (Docker, Electron,
          // hosted web all differ) - the wildcard-origin CORS config this
          // relies on is what makes the proxy deployment-agnostic.
        }}
        targetDatabase={{ strategy: 'manual' }}
        sourceSecrets={{ strategy: 'credentials' }}
        multiSource={{}}
        // secret mounting isn't wired up yet - stub only satisfies the
        // required shape so the component renders
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
