import { faker } from '@faker-js/faker';
import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import {
  IndexConfigFactory,
  IndexHashKeyFactory,
  IndexJsonKeyFactory,
  IndexSchemaFieldFactory,
} from 'e2eSrc/test-data/vector-search';
import { DatabaseInstance } from 'e2eSrc/types';

const uniqueId = faker.string.alphanumeric(6);
const TEST_INDEX_PREFIX = `a-vs-existing-${uniqueId}:`;
const hashKey = IndexHashKeyFactory.build({ keyName: `${TEST_INDEX_PREFIX}key1` });
const jsonKey = IndexJsonKeyFactory.build({ keyName: `${TEST_INDEX_PREFIX}json1` });
const TEST_HASH_KEY = hashKey.keyName;
const TEST_JSON_KEY = jsonKey.keyName;
const seedIndex = IndexConfigFactory.build();

test.use({ featureFlags: { vectorSearchV2: true } });

/**
 * Vector Search > Create Index - Existing Data
 *
 * Tests for creating an index from existing database keys,
 * including schema inference, field editing, and view toggling.
 * Each test completes the full flow: make changes → verify command view → create index.
 */
test.describe('Vector Search > Create Index - Existing Data', { tag: '@serial' }, () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    database = await apiHelper.createDatabase(StandaloneConfigFactory.build());

    await apiHelper.createHashKey(database.id, hashKey.keyName, hashKey.fields);
    await apiHelper.createJsonKey(database.id, jsonKey.keyName, JSON.stringify(jsonKey.value));
  });

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteAllIndexes(database.id, (name) => name.includes(uniqueId) || name === seedIndex.indexName);
  });

  test.afterAll(async ({ apiHelper }) => {
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_INDEX_PREFIX}*`);
    await apiHelper.deleteDatabase(database.id);
  });

  test.beforeEach(async ({ vectorSearchPage, apiHelper, page }) => {
    // Clean indexes and seed one, wait for index to be created
    await apiHelper.deleteAllIndexes(database.id, (name) => name.includes(uniqueId) || name === seedIndex.indexName);
    await apiHelper.createIndex(database.id, seedIndex.indexName, seedIndex.prefix, seedIndex.schema);

    await expect
      .poll(() => apiHelper.getIndexes(database.id).then((indexes) => indexes.includes(seedIndex.indexName)))
      .toBe(true);

    await vectorSearchPage.goto(database.id);

    // Skip onboarding
    await page.evaluate(() => {
      localStorage.setItem('vectorSearchSelectKeyOnboarding', 'true');
      localStorage.setItem('vectorSearchQueryOnboarding', 'true');
      localStorage.setItem('vectorSearchCreateIndexOnboarding', 'true');
    });

    // Navigate to list page and open "Use existing data" form
    await expect(vectorSearchPage.listWrapper).toBeVisible();
    await vectorSearchPage.indexList.openCreateIndex('existing-data');
    await expect(vectorSearchPage.createIndexForm.container).toBeVisible();
  });

  test('should create index with default settings and navigate to query page', async ({ vectorSearchPage }) => {
    // Select key → schema is auto-inferred
    await vectorSearchPage.createIndexForm.selectKey(TEST_HASH_KEY);
    await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

    // Switch to command view
    await vectorSearchPage.createIndexForm.commandViewButton.click();
    await expect(vectorSearchPage.createIndexForm.commandView).toBeVisible();

    // Create index and navigate to query page, verify toast
    await vectorSearchPage.createIndexForm.createIndexButton.click();
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();

    await expect(vectorSearchPage.indexCreatedToast).toBeVisible();
  });

  test('should edit key prefix and create index', async ({ vectorSearchPage }) => {
    // Select key → schema is auto-inferred
    await vectorSearchPage.createIndexForm.selectKey(TEST_HASH_KEY);
    await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

    // Override auto-detected prefix
    const prefixInput = vectorSearchPage.createIndexForm.prefixInput;
    await expect(prefixInput).toBeVisible();
    await prefixInput.clear();
    await prefixInput.fill('custom-prefix:');
    await expect(prefixInput).toHaveValue('custom-prefix:');

    // Switch to command view and verify prefix
    await vectorSearchPage.createIndexForm.commandViewButton.click();
    await expect(vectorSearchPage.createIndexForm.commandView).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.commandView).toContainText('custom-prefix:');

    // Create index and navigate to query page, verify toast
    await vectorSearchPage.createIndexForm.createIndexButton.click();
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.indexCreatedToast).toBeVisible();
  });

  test('should add field and create index', async ({ vectorSearchPage }) => {
    // Select key → schema is auto-inferred
    await vectorSearchPage.createIndexForm.selectKey(TEST_HASH_KEY);
    await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

    // Open add-field modal and add a new TEXT field
    await vectorSearchPage.createIndexForm.addFieldButton.click();

    const { fieldTypeModal } = vectorSearchPage.createIndexForm;
    await expect(fieldTypeModal.fieldNameInput).toBeVisible();

    const newFieldName = `extra-${faker.string.alphanumeric(4)}`;
    await fieldTypeModal.fieldNameInput.fill(newFieldName);
    await fieldTypeModal.saveButton.click();
    await expect(fieldTypeModal.fieldNameInput).not.toBeVisible();

    // Verify new field appears in command view, then create index
    await vectorSearchPage.createIndexForm.commandViewButton.click();
    await expect(vectorSearchPage.createIndexForm.commandView).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.commandView).toContainText(newFieldName);
    await expect(vectorSearchPage.createIndexForm.commandView).toContainText('TEXT');

    // Create index and navigate to query page, verify toast
    await vectorSearchPage.createIndexForm.createIndexButton.click();
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.indexCreatedToast).toBeVisible();
  });

  test('should deselect a field row and exclude it from the index', async ({ vectorSearchPage }) => {
    // Select key → schema is auto-inferred
    await vectorSearchPage.createIndexForm.selectKey(TEST_HASH_KEY);
    await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

    // Deselect the first field row
    const table = vectorSearchPage.createIndexForm.indexDetailsTable;
    const rows = table.getByRole('row');
    const checkboxes = table.getByRole('checkbox');

    const initialCount = await checkboxes.count();
    expect(initialCount).toBeGreaterThan(1);

    const firstDataRow = rows.nth(1);
    const deselectedFieldName = await firstDataRow.locator('td').nth(1).innerText();
    const firstRowCheckbox = firstDataRow.getByRole('checkbox');
    await firstRowCheckbox.uncheck();
    await expect(firstRowCheckbox).not.toBeChecked();

    // Verify deselected field is excluded from the command
    await vectorSearchPage.createIndexForm.commandViewButton.click();
    await expect(vectorSearchPage.createIndexForm.commandView).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.commandView).not.toContainText(deselectedFieldName);

    // Create index and navigate to query page, verify toast
    await vectorSearchPage.createIndexForm.createIndexButton.click();
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.indexCreatedToast).toBeVisible();
  });

  test('should change index name and create index', async ({ vectorSearchPage }) => {
    // Select key → schema is auto-inferred
    await vectorSearchPage.createIndexForm.selectKey(TEST_HASH_KEY);
    await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

    // Enter rename mode and set custom index name
    await expect(vectorSearchPage.createIndexForm.indexNameDisplay).toBeVisible();
    await vectorSearchPage.createIndexForm.indexNameEditButton.click();

    const customName = `custom-idx-${uniqueId}-${faker.string.alphanumeric(6)}`;
    await expect(vectorSearchPage.createIndexForm.indexNameInput).toBeVisible();
    await vectorSearchPage.createIndexForm.indexNameInput.clear();
    await vectorSearchPage.createIndexForm.indexNameInput.fill(customName);

    await vectorSearchPage.createIndexForm.indexNameConfirmButton.click();
    await expect(vectorSearchPage.createIndexForm.indexNameDisplay).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.indexNameDisplay).toContainText(customName);

    // Verify custom name in command view
    await vectorSearchPage.createIndexForm.commandViewButton.click();
    await expect(vectorSearchPage.createIndexForm.commandView).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.commandView).toContainText(customName);

    // Create index and navigate to query page, verify toast
    await vectorSearchPage.createIndexForm.createIndexButton.click();
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.indexCreatedToast).toBeVisible();
  });

  test('should show duplicate index name validation and disable create button', async ({
    vectorSearchPage,
    apiHelper,
  }) => {
    // Create an index via API to establish a duplicate target
    const indexConfig = IndexConfigFactory.build({
      indexName: `dup-idx-${uniqueId}-${faker.string.alphanumeric(6)}`,
      prefix: `${TEST_INDEX_PREFIX}dup:`,
      schema: [IndexSchemaFieldFactory.build({ name: 'name', type: 'text' })],
    });
    await apiHelper.createIndex(database.id, indexConfig.indexName, indexConfig.prefix, indexConfig.schema);

    // Re-navigate so the frontend fetches the updated index list
    await vectorSearchPage.goto(database.id);
    await expect(vectorSearchPage.listWrapper).toBeVisible();

    await vectorSearchPage.indexList.openCreateIndex('existing-data');
    await expect(vectorSearchPage.createIndexForm.container).toBeVisible();

    // Select key
    await vectorSearchPage.createIndexForm.selectKey(TEST_HASH_KEY);
    await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

    // Enter duplicate name and verify confirm is disabled
    await vectorSearchPage.createIndexForm.indexNameEditButton.click();
    await expect(vectorSearchPage.createIndexForm.indexNameInput).toBeVisible();

    await vectorSearchPage.createIndexForm.indexNameInput.clear();
    await vectorSearchPage.createIndexForm.indexNameInput.fill(indexConfig.indexName);

    await expect(vectorSearchPage.createIndexForm.indexNameConfirmButton).toBeDisabled();

    // Cancel to close the rename input
    await vectorSearchPage.createIndexForm.indexNameCancelButton.click();
    await expect(vectorSearchPage.createIndexForm.indexNameDisplay).toBeVisible();
  });

  test('should create index from JSON key and navigate to query page', async ({ vectorSearchPage }) => {
    // Switch to JSON tab so the browser panel shows JSON keys
    await vectorSearchPage.createIndexForm.switchKeyTypeTab('JSON');
    await vectorSearchPage.createIndexForm.selectKey(TEST_JSON_KEY);
    await expect(vectorSearchPage.createIndexForm.content).toBeVisible();

    // Verify the generated command uses "ON JSON" data type
    await vectorSearchPage.createIndexForm.commandViewButton.click();
    await expect(vectorSearchPage.createIndexForm.commandView).toBeVisible();
    await expect(vectorSearchPage.createIndexForm.commandView).toContainText('ON JSON');

    // Create index and navigate to query page, verify toast
    await vectorSearchPage.createIndexForm.createIndexButton.click();
    await expect(vectorSearchPage.queryPageWrapper).toBeVisible();
    await expect(vectorSearchPage.indexCreatedToast).toBeVisible();
  });
});
