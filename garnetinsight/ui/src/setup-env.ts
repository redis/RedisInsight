import { defaultConfig } from 'uiSrc/config/default'

riConfig = defaultConfig

window.app = {
  ...window.app,
  config: {
    apiPort: `${defaultConfig.api.port}`,
  },
}
