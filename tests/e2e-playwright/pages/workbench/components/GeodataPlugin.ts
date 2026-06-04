import { Page, Locator, FrameLocator } from '@playwright/test';

/**
 * Geodata Workbench plugin component.
 *
 * The plugin renders inside a sandboxed iframe, so all content locators are
 * scoped to the most recent plugin frame. View titles are plain text (rendered
 * via Redis UI Typography, not semantic headings), so they are matched with
 * getByText.
 */
export class GeodataPlugin {
  readonly page: Page;
  readonly frame: FrameLocator;

  // View titles
  readonly mapTitle: Locator;
  readonly heatmapTitle: Locator;
  readonly detailsTitle: Locator;

  // Map / heatmap visualizations
  readonly plot: Locator;
  readonly heatmapCanvas: Locator;
  readonly mapTilesDisabledMessage: Locator;

  // Scalar details metric
  readonly distanceLabel: Locator;
  readonly distanceValue: Locator;

  // View-type selector (lives on the result card, outside the iframe)
  private readonly viewTypeSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.frame = page.frameLocator('[data-testid="pluginIframe"]').first();
    this.viewTypeSelect = page.getByTestId('select-view-type').first();

    this.mapTitle = this.frame.getByText('Geospatial map', { exact: true });
    this.heatmapTitle = this.frame.getByText('Geospatial heatmap', { exact: true });
    this.detailsTitle = this.frame.getByText('Geospatial details', { exact: true });

    this.plot = this.frame.getByRole('img', { name: 'Leaflet geospatial plot' });
    this.heatmapCanvas = this.frame.locator('canvas').first();
    this.mapTilesDisabledMessage = this.frame.getByText('Map tiles disabled');

    this.distanceLabel = this.frame.getByText('Distance');
    this.distanceValue = this.frame.getByText(/^\d+(\.\d+)? km$/);
  }

  /** Switch the result to the Geospatial map (markers) view. */
  async showMarkers(): Promise<void> {
    await this.selectView('Geospatial map');
  }

  /** Switch the result to the Geospatial heatmap view. */
  async showHeatmap(): Promise<void> {
    await this.selectView('Geospatial heatmap');
  }

  /**
   * Result table cell for a given geospatial member (e.g. "Palermo").
   */
  memberCell(name: string): Locator {
    return this.frame.getByRole('cell', { name });
  }

  private async selectView(viewName: string): Promise<void> {
    await this.viewTypeSelect.click();
    await this.page.getByText(viewName, { exact: true }).last().click();
  }
}
