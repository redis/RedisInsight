import { test, expect } from '../../../fixtures/base';

// Size of the "M" icon in the UI, in pixels.
const ICON_SIZE_PX = 16;
const ICON_SIZE = `${ICON_SIZE_PX}px`;
const WINDOW_HEIGHT_PX = 1000;
// From a wide window down to a narrow one.
const WINDOW_WIDTHS_PX = [1920, 1400, 1200, 1000, 800];

test.use({ featureFlags: { redisTools: true } });

test.describe('Redis tools > Panel layout', () => {
  // The Electron window cannot be resized from the test.
  test.skip(({ electronApp }) => !!electronApp, 'Window resizing is not available in Electron');

  for (const width of WINDOW_WIDTHS_PX) {
    test(`should keep the icons at full size in a ${width}px wide window`, async ({
      page,
      databasesPage,
      redisToolsPanel,
    }) => {
      await page.setViewportSize({ width, height: WINDOW_HEIGHT_PX });
      await databasesPage.goto();
      await redisToolsPanel.open();

      await expect(redisToolsPanel.radarIcon).toHaveCSS('width', ICON_SIZE);
      await expect(redisToolsPanel.radarIcon).toHaveCSS('height', ICON_SIZE);

      for (const icon of await redisToolsPanel.stepIcons.all()) {
        await expect(icon).toHaveCSS('width', ICON_SIZE);
        await expect(icon).toHaveCSS('height', ICON_SIZE);
      }
    });
  }
});
