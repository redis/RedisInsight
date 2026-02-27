import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory, ClusterConfigFactory } from 'e2eSrc/test-data/databases';
import { DatabaseInstance } from 'e2eSrc/types';
import { faker } from '@faker-js/faker';

test.describe('CLI > CLI Panel', () => {
  let database: DatabaseInstance;
  const uniqueSuffix = `cli-${Date.now().toString(36)}`;

  test.beforeAll(async ({ apiHelper }) => {
    const config = StandaloneConfigFactory.build({
      name: `test-cli-panel-${uniqueSuffix}`,
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

  test.describe('Panel Lifecycle', () => {
    test('should open CLI panel', async ({ cliPanel }) => {
      await cliPanel.open();

      await expect(cliPanel.container).toBeVisible();

      // Using toBeAttached instead of toBeVisible because the element is empty with dimensions 0x0,
      // and is not detected as visible by the browser.
      await expect(cliPanel.commandInput).toBeAttached();
      await expect(cliPanel.hideButton).toBeVisible();
      await expect(cliPanel.closeButton).toBeVisible();
    });

    test('should close CLI panel', async ({ cliPanel }) => {
      await cliPanel.open();
      await expect(cliPanel.container).toBeVisible();

      await cliPanel.close();

      await expect(cliPanel.hideButton).not.toBeVisible();
      await expect(cliPanel.closeButton).not.toBeVisible();
    });

    test('should hide CLI panel and restore it', async ({ cliPanel }) => {
      await cliPanel.open();
      await expect(cliPanel.hideButton).toBeVisible();

      await cliPanel.hide();
      await expect(cliPanel.expandButton).toBeVisible();
      await expect(cliPanel.hideButton).not.toBeVisible();

      await cliPanel.open();
      await expect(cliPanel.container).toBeVisible();
      await expect(cliPanel.hideButton).toBeVisible();
      await expect(cliPanel.commandInput).toBeAttached();
    });
  });

  test.describe('Command Execution', () => {
    test('should execute command and display output', async ({ cliPanel }) => {
      await cliPanel.open();
      await cliPanel.waitForOutput('Connected');

      await cliPanel.executeCommand('PING');

      await expect(cliPanel.successOutput.last()).toContainText('PONG');
    });

    test('should view command output with correct values', async ({ cliPanel }) => {
      const keyName = `test-cli-get-${uniqueSuffix}`;
      const value = faker.lorem.word();

      await cliPanel.open();
      await cliPanel.waitForOutput('Connected');

      await cliPanel.executeCommandAndWait(`SET ${keyName} ${value}`);
      await expect(cliPanel.successOutput.last()).toContainText('OK');

      await cliPanel.executeCommand(`GET ${keyName}`);
      await expect(cliPanel.successOutput.last()).toContainText(value);

      await cliPanel.executeCommand(`DEL ${keyName}`);
    });

    test('should handle command errors', async ({ cliPanel }) => {
      await cliPanel.open();
      await cliPanel.waitForOutput('Connected');

      await cliPanel.executeCommand('INVALID_COMMAND_THAT_DOES_NOT_EXIST');

      await expect(cliPanel.errorOutput.last()).toBeVisible();
      const errorText = await cliPanel.getLastErrorResponse();
      expect(errorText.length).toBeGreaterThan(0);
    });

    test('should execute multiple commands in sequence', async ({ cliPanel }) => {
      const key1 = `test-cli-seq1-${uniqueSuffix}`;
      const key2 = `test-cli-seq2-${uniqueSuffix}`;
      const val1 = faker.lorem.word();
      const val2 = faker.lorem.word();

      await cliPanel.open();
      await cliPanel.waitForOutput('Connected');

      await cliPanel.executeCommandAndWait(`SET ${key1} ${val1}`);
      await expect(cliPanel.successOutput.last()).toContainText('OK');

      await cliPanel.executeCommandAndWait(`SET ${key2} ${val2}`);
      await expect(cliPanel.successOutput.last()).toContainText('OK');

      await cliPanel.executeCommand(`GET ${key1}`);
      await expect(cliPanel.successOutput.last()).toContainText(val1);

      const commandCount = await cliPanel.commandWrapper.count();
      expect(commandCount).toBeGreaterThanOrEqual(3);

      await cliPanel.executeCommand(`DEL ${key1} ${key2}`);
    });
  });

  test.describe('Command History', () => {
    test('should navigate command history with up/down arrows', async ({ cliPanel }) => {
      const cmd1 = 'PING';
      const cmd2 = 'DBSIZE';
      const cmd3 = 'INFO server';

      await cliPanel.open();
      await cliPanel.waitForOutput('Connected');

      await cliPanel.executeCommandAndWait(cmd1);
      await cliPanel.executeCommandAndWait(cmd2);
      await cliPanel.executeCommand(cmd3);
      await cliPanel.waitForOutput('redis_version');

      await cliPanel.pressArrowUp();
      await expect(cliPanel.commandInput).toContainText(cmd3);

      await cliPanel.pressArrowUp();
      await expect(cliPanel.commandInput).toContainText(cmd2);

      await cliPanel.pressArrowUp();
      await expect(cliPanel.commandInput).toContainText(cmd1);

      await cliPanel.pressArrowDown();
      await expect(cliPanel.commandInput).toContainText(cmd2);
    });
  });

  test.describe('Tab Completion', () => {
    test('should complete partial command with Tab', async ({ cliPanel }) => {
      await cliPanel.open();
      await cliPanel.waitForOutput('Connected');

      await cliPanel.typeCommand('PI');
      await cliPanel.pressTab();

      const inputText = await cliPanel.getInputText();
      expect(inputText.toUpperCase()).toContain('PING');
    });
  });
});

test.describe('CLI > CLI Panel > Cluster', () => {
  let clusterDatabase: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    let created = false;
    try {
      const config = ClusterConfigFactory.build();
      clusterDatabase = await apiHelper.createDatabase(config);
      created = true;
    } catch {
      // Cluster not available — tests will be skipped
    }

    test.skip(!created, 'Cluster database is not available');
  });

  test.afterAll(async ({ apiHelper }) => {
    if (clusterDatabase?.id) {
      await apiHelper.deleteDatabase(clusterDatabase.id);
    }
  });

  test.beforeEach(async ({ browserPage }) => {
    await browserPage.goto(clusterDatabase.id);
  });

  test.skip('should run commands on Cluster databases with transparent node redirection', async ({ cliPanel }) => {
    const key1 = `test-cluster-a-${Date.now()}`;
    const key2 = `test-cluster-b-${Date.now()}`;
    const value = faker.lorem.word();

    await cliPanel.open();
    await cliPanel.waitForOutput('Connected');

    await cliPanel.executeCommandAndWait(`SET ${key1} ${value}`);
    await expect(cliPanel.successOutput.last()).toContainText('OK');

    await cliPanel.executeCommandAndWait(`SET ${key2} ${value}`);
    await expect(cliPanel.successOutput.last()).toContainText('OK');

    await cliPanel.executeCommand(`GET ${key1}`);
    await expect(cliPanel.successOutput.last()).toContainText(value);

    await cliPanel.executeCommand(`GET ${key2}`);
    await expect(cliPanel.successOutput.last()).toContainText(value);

    const errorCount = await cliPanel.errorOutput.count();
    expect(errorCount).toBe(0);

    await cliPanel.executeCommand(`DEL ${key1} ${key2}`);
  });
});
