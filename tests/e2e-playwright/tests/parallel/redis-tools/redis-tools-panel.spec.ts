import { test, expect } from '../../../fixtures/base';

// Size of the "M" icon in the UI, in pixels.
const ICON_SIZE_PX = 16;
const ICON_SIZE = `${ICON_SIZE_PX}px`;
const WINDOW_HEIGHT_PX = 1000;
// From a wide window down to one where the panel gets too narrow for its cards.
const WINDOW_WIDTHS_PX = [1920, 1400, 1200, 1000, 800];

// The cards share a row in a wide window and stack in a narrow one.
const WIDE_WINDOW_WIDTH_PX = 1920;
const NARROW_WINDOW_WIDTHS_PX = [1400, 800];
// Tolerance for sub-pixel rounding when comparing positions.
const POSITION_TOLERANCE_PX = 1;

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

      await expect(redisToolsPanel.redvisorIcon).toHaveCSS('width', ICON_SIZE);
      await expect(redisToolsPanel.redvisorIcon).toHaveCSS('height', ICON_SIZE);
      await expect(redisToolsPanel.radarIcon).toHaveCSS('width', ICON_SIZE);
      await expect(redisToolsPanel.radarIcon).toHaveCSS('height', ICON_SIZE);

      for (const icon of await redisToolsPanel.stepIcons.all()) {
        await expect(icon).toHaveCSS('width', ICON_SIZE);
        await expect(icon).toHaveCSS('height', ICON_SIZE);
      }
    });
  }

  test(`should show the cards side by side in a ${WIDE_WINDOW_WIDTH_PX}px wide window`, async ({
    page,
    databasesPage,
    redisToolsPanel,
  }) => {
    await page.setViewportSize({ width: WIDE_WINDOW_WIDTH_PX, height: WINDOW_HEIGHT_PX });
    await databasesPage.goto();
    await redisToolsPanel.open();

    await expect
      .poll(async () => {
        const redvisor = await redisToolsPanel.redvisorCard.boundingBox();
        const radar = await redisToolsPanel.radarCard.boundingBox();
        return Boolean(
          redvisor && radar && Math.abs(radar.y - redvisor.y) <= POSITION_TOLERANCE_PX && radar.x > redvisor.x,
        );
      })
      .toBe(true);
  });

  for (const width of NARROW_WINDOW_WIDTHS_PX) {
    test(`should stack the cards in a ${width}px wide window`, async ({ page, databasesPage, redisToolsPanel }) => {
      await page.setViewportSize({ width, height: WINDOW_HEIGHT_PX });
      await databasesPage.goto();
      await redisToolsPanel.open();

      await expect
        .poll(async () => {
          const redvisor = await redisToolsPanel.redvisorCard.boundingBox();
          const radar = await redisToolsPanel.radarCard.boundingBox();
          return Boolean(
            redvisor &&
            radar &&
            radar.y >= redvisor.y + redvisor.height - POSITION_TOLERANCE_PX &&
            Math.abs(radar.x - redvisor.x) <= POSITION_TOLERANCE_PX,
          );
        })
        .toBe(true);
    });
  }
});
