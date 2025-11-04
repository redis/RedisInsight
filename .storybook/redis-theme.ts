import { create } from '@storybook/theming/create';

export default create({
  base: 'light',

  brandTitle: 'Redis UI',
  brandUrl: 'https://github.com/redislabsdev/redis-ui',
  brandImage: 'logo.svg',
  brandTarget: '_blank',

  colorPrimary: '#001D2D',
  colorSecondary: '#FF4438',

  // UI
  appBg: '#001D2D',

  // Toolbar default and active colors
  barBg: '#F0F0F0',
  textMutedColor: '#5C707A'
});
