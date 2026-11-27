import { test, expect } from '../../../../fixtures/base';
import { RdiInstanceData } from 'e2eSrc/types';
import { RDI_V2_FEATURE_FLAGS, RdiInstanceFactory, RdiPipelineFactory } from 'e2eSrc/test-data/rdi';

/**
 * Theme of the v2 RDI pipeline page (TEST_PLAN.md: 11.2 RDI Pipeline)
 *
 * rdi-ui draws its own theme and ignores RedisInsight's, so RedisInsight
 * passes its light/dark choice through rdi-ui's `appearance` prop. These
 * tests switch the theme in Settings and check the colors rdi-ui renders.
 *
 * Serial: the color theme is a global app setting.
 */
test.use({ featureFlags: RDI_V2_FEATURE_FLAGS });

// Luminance of rdi-ui's table header text: dark text on the light theme, light text on the dark one
const LIGHT_TEXT_MIN_LUMINANCE = 0.5;

test.describe('RDI > Pipeline > Theme', () => {
  let instance: RdiInstanceData;
  let originalTheme: string | null;
  const pipeline = RdiPipelineFactory.build();

  test.beforeAll(async ({ apiHelper }) => {
    originalTheme = (await apiHelper.getSettings()).theme;
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.setTheme(originalTheme ?? 'SYSTEM');
  });

  test.beforeEach(async ({ rdiMock }) => {
    instance = RdiInstanceFactory.build();
    await rdiMock.install(instance, [pipeline]);
  });

  test('should render the pipeline page dark with the dark theme', async ({ settingsPage, rdiPipelinePage }) => {
    await settingsPage.goto();
    await settingsPage.expandGeneral();
    await settingsPage.changeTheme('Dark Theme');

    await rdiPipelinePage.goto(instance.id);

    await expect
      .poll(() => rdiPipelinePage.pipelineList.getHeaderTextLuminance())
      .toBeGreaterThan(LIGHT_TEXT_MIN_LUMINANCE);
  });

  test('should render the pipeline page light with the light theme', async ({ settingsPage, rdiPipelinePage }) => {
    await settingsPage.goto();
    await settingsPage.expandGeneral();
    await settingsPage.changeTheme('Light Theme');

    await rdiPipelinePage.goto(instance.id);

    await expect
      .poll(() => rdiPipelinePage.pipelineList.getHeaderTextLuminance())
      .toBeLessThan(LIGHT_TEXT_MIN_LUMINANCE);
  });
});
