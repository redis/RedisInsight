import {
  CheckThinIcon,
  DatabaseIcon,
  PluginIcon,
  SearchIcon,
  StarsIcon,
  UserIcon,
} from 'uiSrc/components/base/icons'

export const REDIS_TOOLS_INIT_COMMAND = 'npx @redis/redisctl init'

export const REDIS_TOOLS_PASSWORD_MASK = '*****'

export const REDIS_TOOLS_PASSWORD_PLACEHOLDER = '<password>'

export const REDIS_TOOLS_DEFAULT_USERNAME = 'default'

export const REDIS_TOOLS_RADAR_URL = 'https://radar.redis.io'

export const REDIS_TOOLS_UTM_PARAMS =
  'utm_source=redis&utm_medium=app&utm_campaign=redisinsight'

export const REDIS_TOOLS_STEPS = [
  { key: 'redisTools.steps.detectStack', icon: SearchIcon },
  { key: 'redisTools.steps.findAgents', icon: UserIcon },
  { key: 'redisTools.steps.connectDatabase', icon: DatabaseIcon },
  { key: 'redisTools.steps.teachAgents', icon: StarsIcon },
  { key: 'redisTools.steps.addMcp', icon: PluginIcon },
  { key: 'redisTools.steps.proveItWorks', icon: CheckThinIcon },
] as const
