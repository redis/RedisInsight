import { test, expect } from 'e2eSrc/fixtures/base';
import { StandaloneConfigFactory } from 'e2eSrc/test-data/databases';
import { StringKeyFactory, TEST_KEY_PREFIX } from 'e2eSrc/test-data/browser';
import { DatabaseInstance } from 'e2eSrc/types';

const MARKDOWN_FORMAT = 'Markdown';

// A markdown document exercising the pieces the viewer must render: heading,
// bold, a GFM table, a fenced code block and an external link. The link is a
// markdown-native [text](url) link: sanitizing the final serialized HTML runs
// the DOMPurify href hook on every anchor, so native links get target="_blank"
// and rel="noopener noreferrer" too (not just raw-HTML ones). The last line
// carries {, } and > to prove the DOMPurify round-trip renders those literally.
const RENDERED_MARKDOWN = [
  '# Heading Markdown Test',
  '',
  'This has **bold text** and a [Redis link](https://redis.io).',
  '',
  '| Feature | Status |',
  '| ------- | ------ |',
  '| Markdown | ready |',
  '',
  '```js',
  'const answer = 42',
  '```',
  '',
  'Config {a: 1} applies when value > 5.',
].join('\n');
const LITERAL_SYMBOLS_TEXT = 'Config {a: 1} applies when value > 5.';

// Untrusted value from Redis mixing safe markdown with the dangerous parts the
// sanitizer must defuse: a script tag, an event-handler attribute, a javascript:
// link, and a raw-HTML element carrying a JSX expression (inert as HTML text,
// but a JSX parser would execute it). The safe heading must still render.
const XSS_MARKDOWN = [
  '# Safe Heading',
  '<script>window.__xssPwned = true</script>',
  '<img src=x onerror="window.__xssPwned=true">',
  '[raw js link](javascript:alert(1))',
  '<div>{"".constructor.constructor("window.__xssPwned = true")()}</div>',
].join('\n');

/**
 * Browser > Key Details - String Markdown format
 *
 * The Markdown value format renders a String value through the real sanitized
 * markdown pipeline (unified + remark/rehype + DOMPurify). Jest globally mocks
 * that pipeline, so this e2e is the only coverage that runs it end to end -
 * including the XSS sanitization, which matters because Redis values are
 * untrusted input.
 */
test.describe('Browser > Key Details - String Markdown format', () => {
  let database: DatabaseInstance;

  test.beforeAll(async ({ apiHelper }) => {
    const config = StandaloneConfigFactory.build({ name: 'test-key-details-markdown-db' });
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

  test.afterEach(async ({ apiHelper }) => {
    await apiHelper.deleteKeysByPattern(database.id, `${TEST_KEY_PREFIX}*`);
  });

  test('should render a markdown String value through the sanitized pipeline', async ({ apiHelper, browserPage }) => {
    const keyData = StringKeyFactory.build({ value: RENDERED_MARKDOWN });
    await apiHelper.createStringKey(database.id, keyData.keyName, keyData.value);

    // Open the key in the details panel.
    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.keyDetails.waitForKeyDetails();

    // Switch the value format to Markdown and wait for the rendered viewer.
    await browserPage.keyDetails.changeValueFormat(MARKDOWN_FORMAT);
    await browserPage.keyDetails.waitForMarkdownViewer();
    const viewer = browserPage.keyDetails.markdownViewer;

    // Heading renders as a real <h1>, not raw "# " markdown text.
    await expect(viewer.getByRole('heading', { level: 1, name: 'Heading Markdown Test' })).toBeVisible();

    // Inline formatting renders as elements.
    await expect(viewer.locator('strong', { hasText: 'bold text' })).toBeVisible();

    // Markdown-native external link renders, is forced to open in a new tab and
    // is hardened against reverse tabnabbing.
    const link = viewer.getByRole('link', { name: 'Redis link' });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link).toHaveAttribute('href', 'https://redis.io');

    // GFM table renders with header and body cells.
    await expect(viewer.locator('table')).toBeVisible();
    await expect(viewer.locator('th', { hasText: 'Feature' })).toBeVisible();
    await expect(viewer.locator('td', { hasText: 'ready' })).toBeVisible();

    // Fenced code block renders inside <pre><code>.
    await expect(viewer.locator('pre code')).toContainText('const answer = 42');

    // { } and > survive the DOMPurify round-trip and render literally.
    await expect(viewer).toContainText(LITERAL_SYMBOLS_TEXT);
    await expect(viewer).not.toContainText('&gt;');

    // Raw markdown syntax is not shown verbatim.
    await expect(viewer).not.toContainText('# Heading');
    await expect(viewer).not.toContainText('**bold text**');
  });

  test('should render markdown but keep an XSS payload inert', async ({ apiHelper, browserPage, page }) => {
    const keyData = StringKeyFactory.build({ value: XSS_MARKDOWN });
    await apiHelper.createStringKey(database.id, keyData.keyName, keyData.value);

    // Open the key and switch to Markdown.
    await browserPage.keyList.searchKeys(keyData.keyName);
    await browserPage.keyList.clickKey(keyData.keyName);
    await browserPage.keyDetails.waitForKeyDetails();
    await browserPage.keyDetails.changeValueFormat(MARKDOWN_FORMAT);
    await browserPage.keyDetails.waitForMarkdownViewer();
    const viewer = browserPage.keyDetails.markdownViewer;

    // The safe heading still renders alongside the defused payload.
    await expect(viewer.getByRole('heading', { level: 1, name: 'Safe Heading' })).toBeVisible();

    // No injected script executed.
    const xssPwned = await page.evaluate(() => (window as Window & { __xssPwned?: boolean }).__xssPwned);
    expect(xssPwned).toBeUndefined();

    // No dangerous nodes/attributes survived sanitization.
    await expect(viewer.locator('script')).toHaveCount(0);
    await expect(viewer.locator('[onerror]')).toHaveCount(0);
    await expect(viewer.locator('a[href^="javascript:"]')).toHaveCount(0);
  });
});
