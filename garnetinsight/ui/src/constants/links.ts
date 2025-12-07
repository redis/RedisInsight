import { CloudSsoUtmCampaign, OAuthSocialSource } from 'uiSrc/slices/interfaces'

export const EXTERNAL_LINKS = {
  redisIo: 'https://redis.io',
  githubRepo: 'https://github.com/Garnetinsight/Garnetinsight',
  githubIssues: 'https://github.com/Garnetinsight/Garnetinsight/issues',
  releaseNotes: 'https://github.com/Garnetinsight/Garnetinsight/releases',
  userSurvey: 'https://www.surveymonkey.com/r/garnetinsight',
  recommendationFeedback:
    'https://github.com/Garnetinsight/Garnetinsight/issues/new/choose',
  guidesRepo: 'https://github.com/Garnetinsight/Tutorials',
  redisStack:
    'https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/',
  cloudConsole: 'https://aka.ms/garnet-portal',
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
}

export const UTM_CAMPAINGS: Record<any, string> = {
  [OAuthSocialSource.Tutorials]: 'garnetinsight_tutorials',
  [OAuthSocialSource.BrowserSearch]: 'garnetinsight_browser_search',
  [OAuthSocialSource.Workbench]: 'garnetinsight_workbench',
  [CloudSsoUtmCampaign.BrowserFilter]: 'browser_filter',
  [OAuthSocialSource.EmptyDatabasesList]: 'empty_db_list',
  [OAuthSocialSource.AddDbForm]: 'add_db_form',
  PubSub: 'pub_sub',
  Main: 'main',
  RedisJson: 'garnetinsight_redisjson',
}

export const UTM_MEDIUMS = {
  App: 'app',
  Main: 'main',
  Rdi: 'rdi',
  Recommendation: 'recommendation',
  Settings: 'settings',
  VectorSearchOnboarding: 'vss_onboarding',
}
