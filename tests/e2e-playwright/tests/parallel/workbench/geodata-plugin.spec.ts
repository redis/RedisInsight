import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

const MARKERS_VIEW_NAME = 'Geospatial map';
const HEATMAP_VIEW_NAME = 'Geospatial heatmap';

const GEO_KEY = 'Sicily';
const GEOADD_COMMAND = [
  `GEOADD ${GEO_KEY}`,
  '13.361389 38.115556 Palermo',
  '15.087269 37.502669 Catania',
  '12.496366 41.902782 Rome',
].join(' ');
const GEOSEARCH_COMMAND = `GEOSEARCH ${GEO_KEY} FROMLONLAT 15 37 BYRADIUS 300 km WITHCOORD WITHDIST WITHHASH`;
const GEODIST_COMMAND = `GEODIST ${GEO_KEY} Palermo Catania km`;

test.describe('Workbench > Geodata plugin', () => {
  let database: DatabaseInstance;
  const uniqueSuffix = `geodata-${Date.now().toString(36)}`;

  test.beforeAll(async ({ apiHelper }) => {
    const config = StandaloneConfigFactory.build({
      name: `test-geodata-plugin-${uniqueSuffix}`,
    });
    database = await apiHelper.createDatabase(config);
    await apiHelper.sendCommand(database.id, `DEL ${GEO_KEY}`);
    await apiHelper.sendCommand(database.id, GEOADD_COMMAND);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.sendCommand(database.id, `DEL ${GEO_KEY}`);
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ apiHelper, workbenchPage }) => {
    await apiHelper.deleteCommandExecutions(database.id);
    await workbenchPage.goto(database.id);
  });

  test('renders Geospatial map by default for coordinate search results', async ({ workbenchPage }) => {
    await workbenchPage.executeCommand(GEOSEARCH_COMMAND);

    const frame = workbenchPage.resultsPanel.pluginFrame();
    await expect(workbenchPage.resultsPanel.pluginResult).toBeVisible();
    await expect(frame.getByRole('heading', { name: MARKERS_VIEW_NAME })).toBeVisible();
    await expect(frame.getByRole('img', { name: 'Leaflet geospatial plot' })).toBeVisible();
    await expect(frame.getByText('Map tiles disabled')).not.toBeVisible();
  });

  test('switches coordinate search results to Geospatial heatmap', async ({ workbenchPage }) => {
    await workbenchPage.executeCommand(GEOSEARCH_COMMAND);
    await workbenchPage.selectPluginView(HEATMAP_VIEW_NAME);

    const frame = workbenchPage.resultsPanel.pluginFrame();
    await expect(frame.getByRole('heading', { name: HEATMAP_VIEW_NAME })).toBeVisible();
    await expect(frame.locator('canvas').first()).toBeVisible();
  });

  test('switches coordinate search results back to Geospatial map', async ({ workbenchPage }) => {
    await workbenchPage.executeCommand(GEOSEARCH_COMMAND);
    await workbenchPage.selectPluginView(HEATMAP_VIEW_NAME);
    await workbenchPage.selectPluginView(MARKERS_VIEW_NAME);

    const frame = workbenchPage.resultsPanel.pluginFrame();
    await expect(frame.getByRole('heading', { name: MARKERS_VIEW_NAME })).toBeVisible();
    await expect(frame.getByRole('img', { name: 'Leaflet geospatial plot' })).toBeVisible();
    await expect(frame.getByRole('cell', { name: 'Palermo' })).toBeVisible();
  });

  test('renders Geospatial details by default for scalar GEO commands', async ({ workbenchPage }) => {
    await workbenchPage.executeCommand(GEODIST_COMMAND);

    const frame = workbenchPage.resultsPanel.pluginFrame();
    await expect(frame.getByRole('heading', { name: 'Geospatial details' })).toBeVisible();
    await expect(frame.getByText('Distance')).toBeVisible();
    await expect(frame.getByText(/^\d+(\.\d+)? km$/)).toBeVisible();
  });
});
