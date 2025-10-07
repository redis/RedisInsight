import { Nullable } from 'uiSrc/utils'
import { Instance } from 'uiSrc/slices/interfaces/instances'

import { OAuthProvider } from 'uiSrc/components/oauth/oauth-select-plan/constants'
import { CloudJobInfo, CloudJobStatus } from 'apiSrc/modules/cloud/job/models'
import { CloudUser } from 'apiSrc/modules/cloud/user/models'
import { CloudSubscriptionPlanResponse } from 'apiSrc/modules/cloud/subscription/dto'

export interface CloudJobInfoState extends Omit<CloudJobInfo, 'status'> {
  status: '' | CloudJobStatus
}

export interface StateAppOAuth {
  loading: boolean
  error: string
  message: string
  source: Nullable<OAuthSocialSource>
  job: Nullable<CloudJobInfoState>
  user: {
    initialLoading: boolean
    error: string
    loading: boolean
    data: Nullable<CloudUser>
    freeDb: CloudUserFreeDbState
  }
  plan: {
    isOpenDialog: boolean
    data: CloudSubscriptionPlanResponse[]
    loading: boolean
  }
  isOpenSocialDialog: boolean
  isOpenSelectAccountDialog: boolean
  showProgress: boolean
  capiKeys: {
    loading: boolean
    data: Nullable<CloudCapiKey[]>
  }
  agreement: boolean
}

export interface CloudImportDatabaseResources {
  subscriptionId: number
  databaseId?: number
  region: string
  provider?: string
}

export interface Region {
  provider: string
  regions: string[]
}

export interface CloudCapiKey {
  id: string
  name: string
  valid: boolean
  createdAt: string
  lastUsed?: string
}

export interface CloudUserFreeDbState {
  loading: boolean
  error: string
  data: Nullable<Instance>
}

export interface CloudSuccessResult {
  resourceId: string
  provider?: OAuthProvider
  region?: string
}

export enum OAuthSocialSource {
  Browser = 'browser',
  ListOfDatabases = 'list of databases',
  DatabaseConnectionList = 'database connection list',
  WelcomeScreen = 'welcome screen',
  BrowserContentMenu = 'browser content menu',
  BrowserFiltering = 'browser filtering',
  BrowserSearch = 'browser search',
  BrowserRedisJSON = 'browser RedisJSON',
  RediSearch = 'workbench RediSearch',
  RedisJSON = 'workbench RedisJSON',
  RedisTimeSeries = 'workbench RedisTimeSeries',
  RedisGraph = 'workbench RedisGraph',
  RedisBloom = 'workbench RedisBloom',
  Autodiscovery = 'autodiscovery',
  SettingsPage = 'settings',
  ConfirmationMessage = 'confirmation message',
  Workbench = 'workbench',
  Tutorials = 'tutorials',
  EmptyDatabasesList = 'empty_db_list',
  DatabasesList = 'db_list',
  DiscoveryForm = 'discovery form',
  UserProfile = 'user profile',
  AiChat = 'ai chat',
  NavigationMenu = 'navigation menu',
  AddDbForm = 'add db form',
}

export enum OAuthSocialAction {
  Create = 'create',
  Import = 'import',
  SignIn = 'signIn',
}

export enum OAuthStrategy {
  Google = 'google',
  GitHub = 'github',
  SSO = 'sso',
  Microsoft = 'microsoft',
}

export enum CloudSsoUtmCampaign {
  ListOfDatabases = 'list_of_databases',
  Workbench = 'redisinsight_workbench',
  WelcomeScreen = 'welcome_screen',
  BrowserSearch = 'redisinsight_browser_search',
  BrowserOverview = 'redisinsight_browser_overview',
  BrowserFilter = 'browser_filter',
  Tutorial = 'tutorial',
  AutoDiscovery = 'auto_discovery',
  Copilot = 'copilot',
  UserProfile = 'user_account',
  Settings = 'settings',
  NavigationMenu = 'navigation_menu',
  AddDbForm = 'add_db_form',
  Unknown = 'other',
}
