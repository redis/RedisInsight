import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';

test.describe('Command Helper > Vector Set commands', () => {
  let database: DatabaseInstance;
  const uniqueSuffix = `cmd-helper-vset-${Date.now().toString(36)}`;

  test.beforeAll(async ({ apiHelper }) => {
    const config = StandaloneConfigFactory.build({
      name: `test-command-helper-vector-set-${uniqueSuffix}`,
    });
    database = await apiHelper.createDatabase(config);
  });

  test.afterAll(async ({ apiHelper }) => {
    if (database?.id) {
      await apiHelper.deleteDatabase(database.id);
    }
  });

  test.beforeEach(async ({ browserPage }) => {
    await browserPage.goto(database.id);
  });

  test('VADD surfaces in search results with summary and details', async ({
    commandHelperPanel,
  }) => {
    await commandHelperPanel.open();

    await commandHelperPanel.search('VADD');
    await expect(commandHelperPanel.searchResultTitles.first()).toBeVisible();

    await commandHelperPanel.selectCommand('VADD');

    await expect(commandHelperPanel.commandTitle).toBeVisible();
    await expect(commandHelperPanel.commandSummary).toBeVisible();
    expect((await commandHelperPanel.getCommandTitle()).toUpperCase()).toContain(
      'VADD',
    );
  });

  test('Vector Set group filter narrows the list to Vector Set commands', async ({
    commandHelperPanel,
  }) => {
    await commandHelperPanel.open();
    await commandHelperPanel.search('');

    await commandHelperPanel.filterByCategory('vector_set');

    await expect(commandHelperPanel.searchResultTitles.first()).toBeVisible();
    const count = await commandHelperPanel.getSearchResultCount();
    // 12 documented Vector Set commands.
    expect(count).toBeGreaterThanOrEqual(12);
  });
});
