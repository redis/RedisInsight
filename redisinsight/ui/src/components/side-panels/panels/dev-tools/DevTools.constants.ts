import {
  CheckThinIcon,
  DatabaseIcon,
  PluginIcon,
  SearchIcon,
  StarsIcon,
  UserIcon,
} from 'uiSrc/components/base/icons'

export const DEV_TOOLS_INIT_COMMAND = 'npx @redis/redisctl init'

export const DEV_TOOLS_PASSWORD_MASK = '*****'

export const DEV_TOOLS_PASSWORD_PLACEHOLDER = '<password>'

export const DEV_TOOLS_DEFAULT_USERNAME = 'default'

export const DEV_TOOLS_RADAR_URL = 'https://radar.redis.io'

export const DEV_TOOLS_UTM_PARAMS =
  'utm_source=redis&utm_medium=app&utm_campaign=redisinsight'

export const DEV_TOOLS_STEPS = [
  { key: 'devTools.steps.detectStack', icon: SearchIcon },
  { key: 'devTools.steps.findAgents', icon: UserIcon },
  { key: 'devTools.steps.connectDatabase', icon: DatabaseIcon },
  { key: 'devTools.steps.teachAgents', icon: StarsIcon },
  { key: 'devTools.steps.addMcp', icon: PluginIcon },
  { key: 'devTools.steps.proveItWorks', icon: CheckThinIcon },
] as const
