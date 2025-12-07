import { PartialConfig } from 'uiSrc/config/default'

type DomainConfigs = {
  [key: string]: PartialConfig
}

const config: DomainConfigs = {}

const domainConfig = config[window.location.host] || {}

export { domainConfig }
