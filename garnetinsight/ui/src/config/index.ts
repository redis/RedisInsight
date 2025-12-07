import { merge, cloneDeep } from 'lodash'
import { Config } from 'uiSrc/config/default'
import { domainConfig } from './domain'

let config: Config

export const getConfig = (): Config => {
  if (config) {
    return config
  }

  config = cloneDeep(riConfig)
  merge(config, domainConfig)

  return config
}
