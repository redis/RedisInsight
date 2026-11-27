import React, { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  NavigationService,
  RdiPipelines,
  RdiPipelinesNavigationGuard,
  createDirectConfigTranslate,
} from '@rdi-ui/pipeline'
import { Pages } from 'uiSrc/constants'
import { Theme } from 'uiSrc/constants/themes'
import { CustomHeaders } from 'uiSrc/constants/api'
import { getBaseUrl } from 'uiSrc/services/apiService'
import { useThemeContext } from 'uiSrc/contexts/themeContext'

export interface Props {
  rdiInstanceId: string
  // RdiPipelines titles the pipeline list and its breadcrumb with this
  rdiInstanceAlias: string
  // Shared with the page header, which renders the breadcrumb in place of
  // rdi-ui's own, so its links reach the open pipeline's unsaved-changes check
  navigation: NavigationService
  navigationGuard: RdiPipelinesNavigationGuard
}

// Stable across renders - no dependency on props/state - so identity never
// changes and can't retrigger RdiPipelines' own mount-effects, unlike
// an inline object literal recreated on every render (this component
// re-renders on every wizard-step navigation, since the page's breadcrumb
// hook subscribes to location).
const TARGET_DATABASE = { strategy: 'manual' as const }
const SOURCE_SECRETS = { strategy: 'credentials' as const }
const MULTI_SOURCE = { enabled: true }
// rdi-ui mounts credentials as RDI per-database pipeline secrets itself,
// matching the `${<DB>_DB_<KEY>}` references createDirectConfigTranslate writes
const PIPELINE_SECRETS = { strategy: 'rdi' as const }

const RdiPipeline = ({
  rdiInstanceId,
  rdiInstanceAlias,
  navigation,
  navigationGuard,
}: Props) => {
  const { theme } = useThemeContext()

  const queryClient = useMemo(() => new QueryClient(), [rdiInstanceId])

  // Translates between the RDI pipeline config and rdi-ui's UI draft. It
  // remembers the last config it read so the next save builds on it, so it's
  // created once per RDI instance rather than shared across instances.
  const configTranslate = useMemo(
    () => createDirectConfigTranslate(),
    [rdiInstanceId],
  )

  // rdi-ui renders with its own bundled @redis-ui/styles theme and never
  // picks up a host ThemeProvider, so RedisInsight's theme reaches it only
  // through `appearance`. The theme context already resolves System to
  // Light or Dark.
  const appearance = theme === Theme.Dark ? 'dark' : 'light'

  // Memoized for the same reason as the constants above - these depend on
  // props, so they can't be hoisted alongside them.
  const rdiInstance = useMemo(
    () => ({ alias: rdiInstanceAlias }),
    [rdiInstanceAlias],
  )

  const rdiClient = useMemo(
    () => ({
      baseUrl: `${getBaseUrl()}rdi/${rdiInstanceId}/proxy`,
      // Electron's WindowAuthMiddleware guards every API route (including
      // this proxy) on window.windowId; this client bypasses apiService's
      // own interceptor that normally attaches it, so it has to be set here
      // too.
      ...(window.windowId && {
        headers: { [CustomHeaders.WindowId]: window.windowId },
      }),
      // Deliberately no `withCredentials`: the API's CORS setup
      // (app.enableCors() with no options, in main.ts) answers with
      // Access-Control-Allow-Origin: *, which browsers reject for a
      // credentialed (cross-origin, cookie-carrying) request. The proxy
      // authenticates to the RDI instance server-side, so the browser has
      // no cookie to send here anyway. Turning this on would also require
      // enableCors() to know the exact origin RedisInsight is served from,
      // which isn't knowable ahead of time (Docker, Electron, hosted web
      // all differ) - the wildcard-origin CORS config this relies on is
      // what makes the proxy deployment-agnostic.
    }),
    [rdiInstanceId],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <RdiPipelines
        basePath={Pages.rdiPipelineManagementV2(rdiInstanceId)}
        rdiInstance={rdiInstance}
        navigation={navigation}
        navigationGuard={navigationGuard}
        hideBreadcrumb
        rdiClient={rdiClient}
        targetDatabase={TARGET_DATABASE}
        sourceSecrets={SOURCE_SECRETS}
        multiSource={MULTI_SOURCE}
        pipelineSecrets={PIPELINE_SECRETS}
        configTranslate={configTranslate}
        appearance={appearance}
        polling={{ pipelineStatus: 2_000 }}
      />
    </QueryClientProvider>
  )
}

export default RdiPipeline
