import React, { useMemo } from 'react'
import { useParams, useRouteMatch } from 'react-router-dom'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { themes as rdiUiThemes } from '@redis-ui/styles-rdi'
import {
  PipelineManagement,
  mapDraftToNativeConfig,
  mapNativeConfigToDraft,
} from '@redislabsdev/rdi-ui'
import type { PipelineManagementProps } from '@redislabsdev/rdi-ui'

import { useAppSelector } from 'uiSrc/slices/hooks'
import { appCsrfSelector } from 'uiSrc/slices/app/csrf'
import { getBaseUrl } from 'uiSrc/services/apiService'
import { CustomHeaders } from 'uiSrc/constants/api'
import { Theme } from 'uiSrc/constants/themes'
import { useThemeContext } from 'uiSrc/contexts/themeContext'

import { useRdiUiNavigation } from './hooks/useRdiUiNavigation'
import * as S from './RdiManagementPage.style'

/**
 * RDI pipeline management backed by the shared @redislabsdev/rdi-ui package.
 *
 * Gated behind the `dev-rdiUi` flag; the existing RedisInsight-native pipeline
 * management pages stay untouched and remain the default.
 *
 * The package talks the native RDI API through RedisInsight's passthrough proxy
 * (`/api/rdi/:id/proxy/*`), which attaches the stored instance credentials
 * server-side.
 */
export const RdiManagementPage = () => {
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { url } = useRouteMatch()
  const { token: csrfToken } = useAppSelector(appCsrfSelector)
  const navigation = useRdiUiNavigation()
  const { theme } = useThemeContext()

  /**
   * The package bundles its own @redis-ui/components but reads the theme from
   * the host's styled-components provider, so the two have to agree on the
   * theme's shape. RedisInsight is on @redis-ui/styles 15, whose
   * `components.layouts` is `{ flexGroup, flexDivider }`, while the bundled
   * components expect the styles 21 shape (`{ gap, padding, margin, ... }`) and
   * crash on `layouts.gap.S`.
   *
   * Until RedisInsight upgrades @redis-ui/* wholesale, override the theme for
   * this subtree only, using an aliased styles 21 install. The rest of the app
   * keeps the version 15 theme.
   */
  const rdiUiTheme = useMemo(
    () => (theme === Theme.Dark ? rdiUiThemes.dark : rdiUiThemes.light),
    [theme],
  )

  const rdiClient = useMemo<PipelineManagementProps['rdiClient']>(
    () => ({
      baseUrl: `${getBaseUrl()}rdi/${rdiInstanceId}/proxy/`,
      headers: csrfToken ? { [CustomHeaders.CsrfToken]: csrfToken } : {},
      // Deliberately no `withCredentials`: the API answers with
      // `Access-Control-Allow-Origin: *`, which browsers reject for
      // credentialed requests. Mirrors RedisInsight's own axios instance,
      // which only enables credentials for a hosted API base URL.
    }),
    [rdiInstanceId, csrfToken],
  )

  // On-prem RDI keeps secrets inline in the pipeline config rather than in an
  // external secret store, so there is nothing to mount.
  const pipelineSecrets = useMemo<PipelineManagementProps['pipelineSecrets']>(
    () => ({ mountSecrets: async () => {} }),
    [],
  )

  /**
   * Redis Cloud translates between the native RDI config and the package's draft
   * shape server-side. A direct RDI connection has no such service, so use the
   * reference mappers the package exports.
   *
   * The v2 `/pipelines/{name}` endpoint wraps the config in a PipelineResponse,
   * while v1 returns it bare — unwrap so either shape works.
   */
  const configTranslate = useMemo<PipelineManagementProps['configTranslate']>(
    () => ({
      translateNativeConfigToDraft: async (config) =>
        mapNativeConfigToDraft(
          (config as { config?: never })?.config ?? config,
        ),
      translateDraftToNativeConfig: async (draft) =>
        mapDraftToNativeConfig(draft),
    }),
    [],
  )

  return (
    <S.PageContainer>
      <StyledThemeProvider theme={rdiUiTheme}>
        <PipelineManagement
          basePath={url.replace(/^\//, '')}
          navigation={navigation}
          rdiClient={rdiClient}
          configTranslate={configTranslate}
          pipelineSecrets={pipelineSecrets}
          multiSource={{ enabled: true }}
          // A direct RDI connection has no database catalogue: the user enters
          // the target connection by hand.
          targetDatabase={{ strategy: 'manual' }}
          // No AWS Secrets Manager on-prem: credentials are entered directly.
          sourceSecrets={{ strategy: 'credentials' }}
          polling={{ pipelineStatus: 5_000, monitoringStatistics: 5_000 }}
        />
      </StyledThemeProvider>
    </S.PageContainer>
  )
}

export default RdiManagementPage
