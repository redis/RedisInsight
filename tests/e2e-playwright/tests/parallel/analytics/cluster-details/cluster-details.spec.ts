import { test, expect } from 'e2eSrc/fixtures/base';
import { ClusterConfigFactory, ClusterHostnameConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

/**
 * Cluster Details Tests (TEST_PLAN.md: 6.3 Cluster Details)
 *
 * Tests for the Overview tab on OSS Cluster databases.
 * Covers both IP-based and hostname-based cluster configurations.
 */

test.describe('Cluster Details > IP-based cluster', () => {
  const EXPECTED_NODES = 3;
  const EXPECTED_NODE_PORTS = [8200, 8201, 8202];

  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config = ClusterConfigFactory.build();
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test('should display cluster overview with all nodes', async ({ analyticsPage }) => {
    await analyticsPage.gotoClusterOverview(database.id);

    // Header shows cluster type, version, and uptime
    await expect(analyticsPage.clusterDetailsContent).toContainText('OSS Cluster');
    await expect(analyticsPage.clusterDetailsContent).toContainText(/7\.\d+\.\d+/);
    await expect(analyticsPage.clusterDetailsUptime).not.toHaveText('');

    // Memory donut chart renders with title and a real value (Keys chart hidden when 0 keys)
    await expect(analyticsPage.page.getByTestId('donut-title-memory')).toContainText('Memory');
    await expect(analyticsPage.clusterDetailsCharts).toContainText(/[\d.]+ [KMGT]?B/);

    // Nodes table contains all 3 primary nodes with correct host:port
    await expect(analyticsPage.page.getByText(`${EXPECTED_NODES} Primary nodes`)).toBeVisible();
    await expect(analyticsPage.page.getByTestId('node-letter')).toHaveCount(EXPECTED_NODES);

    for (const port of EXPECTED_NODE_PORTS) {
      await expect(analyticsPage.page.getByText(`host.docker.internal:${port}`)).toBeVisible();
    }
  });
});

test.describe('Cluster Details > Hostname-based cluster', () => {
  const EXPECTED_NODES = 3;
  const EXPECTED_NODE_HOSTS = ['master-hostname-7-1:8210', 'master-hostname-7-2:8211', 'master-hostname-7-3:8212'];

  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config = ClusterHostnameConfigFactory.build();
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test('should display cluster overview with hostname-announced nodes', async ({ analyticsPage }) => {
    await analyticsPage.gotoClusterOverview(database.id);

    // Header shows cluster type, version, and uptime
    await expect(analyticsPage.clusterDetailsContent).toContainText('OSS Cluster');
    await expect(analyticsPage.clusterDetailsContent).toContainText('7.0.0');
    await expect(analyticsPage.clusterDetailsUptime).not.toHaveText('');

    // Memory donut chart renders with title and a real value (Keys chart hidden when 0 keys)
    await expect(analyticsPage.page.getByTestId('donut-title-memory')).toContainText('Memory');
    await expect(analyticsPage.clusterDetailsCharts).toContainText(/[\d.]+ [KMGT]?B/);

    // Nodes table contains all 3 primary nodes with hostnames (not IPs)
    await expect(analyticsPage.page.getByText(`${EXPECTED_NODES} Primary nodes`)).toBeVisible();
    await expect(analyticsPage.page.getByTestId('node-letter')).toHaveCount(EXPECTED_NODES);

    for (const hostPort of EXPECTED_NODE_HOSTS) {
      await expect(analyticsPage.page.getByText(hostPort)).toBeVisible();
    }
  });
});
