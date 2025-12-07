import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import vc from './vite.config'

const config: StorybookConfig = {
  async viteFinal(inlineConfig) {
    // return the customized config
    return mergeConfig(inlineConfig, vc)
  },
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../garnetinsight/ui/src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../garnetinsight/ui/src/**/*.mdx',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-links',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}
export default config
