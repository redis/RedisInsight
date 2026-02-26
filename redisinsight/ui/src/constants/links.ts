import { CloudSsoUtmCampaign, OAuthSocialSource } from 'uiSrc/slices/interfaces'

export const EXTERNAL_LINKS = {
  redisIo: 'https://redis.io',
  githubRepo: 'https://github.com/RedisInsight/RedisInsight',
  githubIssues: 'https://github.com/RedisInsight/RedisInsight/issues',
  releaseNotes: 'https://github.com/RedisInsight/RedisInsight/releases',
  userSurvey: 'https://www.surveymonkey.com/r/redisinsight',
  recommendationFeedback:
    'https://github.com/RedisInsight/RedisInsight/issues/new/choose',
  guidesRepo: 'https://github.com/RedisInsight/Tutorials',
  redisStack:
    'https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/',
  cloudConsole: 'https://cloud.redis.io/#/databases/',
  tryFree: 'https://redis.io/try-free',
  docker: 'https://redis.io/docs/install/install-stack/docker',
  rdiQuickStart:
    'https://redis.io/docs/latest/integrate/redis-data-integration/ingest/quick-start-guide/',
  rdiPipeline:
    'https://redis.io/docs/latest/integrate/redis-data-integration/data-pipelines/',
  rdiPipelineTransforms:
    'https://redis.io/docs/latest/integrate/redis-data-integration/ingest/data-pipelines/transform-examples/',
  pubSub: 'https://redis.io/docs/latest/commands/psubscribe/',
  legalPrivacyPolicy: 'https://redis.io/legal/privacy-policy/',
  redisEnterpriseCloud: 'https://redis.io/redis-enterprise-cloud/overview/',
  redisQueryEngine: 'https://redis.io/docs/latest/develop/ai/search-and-query/',
  redisForAI: 'https://redis.io/redis-for-ai/',
  vectorDatabaseGettingStarted:
    'https://redis.io/docs/latest/develop/get-started/vector-database/',
  redisSandbox: 'https://redis.io/try/sandbox/',
  searchIndexes:
    'https://redis.io/docs/latest/develop/ai/search-and-query/query/vector-search/',
}

export const UTM_CAMPAINGS: Record<any, string> = {
  [OAuthSocialSource.Tutorials]: 'redisinsight_tutorials',
  [OAuthSocialSource.BrowserSearch]: 'redisinsight_browser_search',
  [OAuthSocialSource.Workbench]: 'redisinsight_workbench',
  [CloudSsoUtmCampaign.BrowserFilter]: 'browser_filter',
  [OAuthSocialSource.EmptyDatabasesList]: 'empty_db_list',
  [OAuthSocialSource.AddDbForm]: 'add_db_form',
  PubSub: 'pub_sub',
  Main: 'main',
  RedisJson: 'redisinsight_redisjson',
}

export const UTM_MEDIUMS = {
  App: 'app',
  Main: 'main',
  Rdi: 'rdi',
  Recommendation: 'recommendation',
  Settings: 'settings',
  VectorSearchOnboarding: 'vss_onboarding',
}
