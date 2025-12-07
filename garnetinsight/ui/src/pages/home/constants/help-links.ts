import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { TelemetryEvent } from 'uiSrc/telemetry'

export interface IHelpGuide {
  id: string
  title: string
  url: string
  description?: string
  event?: string
  primary?: boolean
  onClick?: (e: React.MouseEvent, source: OAuthSocialSource) => void
}

export const HELP_LINKS = {
  cloud: {
    event: TelemetryEvent.CREATE_FREE_CLOUD_DATABASE_CLICKED,
    sources: {
      welcome: 'Welcome page',
      databaseList: 'list of databases',
      databaseConnectionList: 'database connection list',
      redisearch: 'RediSearch is not loaded',
    },
  },
  source: {
    event: TelemetryEvent.BUILD_FROM_SOURCE_CLICKED,
  },
  docker: {
    event: TelemetryEvent.BUILD_USING_DOCKER_CLICKED,
  },
  homebrew: {
    event: TelemetryEvent.BUILD_USING_HOMEBREW_CLICKED,
  },
}
