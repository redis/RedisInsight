import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

const MARKERS_VIEW_NAME = 'Geo Map';
const HEATMAP_VIEW_NAME = 'Geo Heatmap';

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

  test('renders Geo Map by default for coordinate search results', async ({ workbenchPage }) => {
    await workbenchPage.executeCommand(GEOSEARCH_COMMAND);

    const frame = workbenchPage.resultsPanel.pluginFrame();
    await expect(workbenchPage.resultsPanel.pluginResult).toBeVisible();
    await expect(frame.getByRole('heading', { name: 'Geo Map' })).toBeVisible();
    await expect(frame.getByRole('img', { name: 'Leaflet geospatial plot' })).toBeVisible();
    await expect(frame.getByText('Map tiles disabled')).not.toBeVisible();
  });

  test('switches coordinate search results to Geo Heatmap', async ({ workbenchPage }) => {
    await workbenchPage.executeCommand(GEOSEARCH_COMMAND);
    await workbenchPage.selectPluginView(HEATMAP_VIEW_NAME);

    const frame = workbenchPage.resultsPanel.pluginFrame();
    await expect(frame.getByRole('heading', { name: 'Geo Heatmap' })).toBeVisible();
    await expect(frame.locator('canvas').first()).toBeVisible();
  });

  test('switches coordinate search results back to Geo Map', async ({ workbenchPage }) => {
    await workbenchPage.executeCommand(GEOSEARCH_COMMAND);
    await workbenchPage.selectPluginView(HEATMAP_VIEW_NAME);
    await workbenchPage.selectPluginView(MARKERS_VIEW_NAME);

    const frame = workbenchPage.resultsPanel.pluginFrame();
    await expect(frame.getByRole('heading', { name: 'Geo Map' })).toBeVisible();
    await expect(frame.getByRole('img', { name: 'Leaflet geospatial plot' })).toBeVisible();
    await expect(frame.getByRole('cell', { name: 'Palermo' })).toBeVisible();
  });

  test('renders Geo Inspector by default for scalar GEO commands', async ({ workbenchPage }) => {
    await workbenchPage.executeCommand(GEODIST_COMMAND);

    const frame = workbenchPage.resultsPanel.pluginFrame();
    await expect(frame.getByRole('heading', { name: 'Geo Inspector' })).toBeVisible();
    await expect(frame.getByText('Distance')).toBeVisible();
    await expect(frame.getByText(/^\d+(\.\d+)? km$/)).toBeVisible();
  });
});
