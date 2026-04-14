import { Page, Locator } from '@playwright/test';

/**
 * Query Results component
 * Displays results from search queries.
 *
 * The results panel contains:
 * - A "Clear Results" button to remove all results
 * - Individual query cards, each with actions (re-run, delete, expand, fullscreen)
 */
export class QueryResults {
  readonly page: Page;

  readonly container: Locator;
  readonly noResults: Locator;
  readonly clearResultsButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.container = page.getByTestId('query-results');
    this.noResults = page.getByText('Your query results will appear here once you run a query.');
    this.clearResultsButton = page.getByRole('button', { name: 'Clear Results' });
  }

  /**
   * Get a query card by its container testid
   */
  getCard(id: string): Locator {
    return this.page.getByTestId(`query-card-container-${id}`);
  }

  /**
   * Get the first query card header (clickable to expand/collapse)
   */
  get firstCardHeader(): Locator {
    return this.container.getByTestId('query-card-open').first();
  }

  /**
   * Get the re-run button on the first result card.
   * exact: true prevents matching the outer div[role="button"] card header
   * whose accessible name contains "Re-run command" as a substring.
   */
  get firstCardReRunButton(): Locator {
    return this.container.getByRole('button', { name: 'Re-run command', exact: true }).first();
  }

  /**
   * Get the delete button on the first result card.
   * exact: true prevents matching the outer div[role="button"] card header
   * whose accessible name contains "Delete command" as a substring.
   */
  get firstCardDeleteButton(): Locator {
    return this.container.getByRole('button', { name: 'Delete command', exact: true }).first();
  }

  /**
   * Get the fullscreen toggle on the first result card.
   * exact: true prevents matching the outer div[role="button"] card header.
   */
  get firstCardFullScreenButton(): Locator {
    return this.container.getByRole('button', { name: 'Open full screen', exact: true }).first();
  }

  /**
   * Get the expand/collapse toggle on the first result card.
   * exact: true prevents matching the outer div[role="button"] card header.
   */
  get firstCardToggleCollapseButton(): Locator {
    return this.container.getByRole('button', { name: 'toggle collapse', exact: true }).first();
  }

  /**
   * Get the command text of the first result card (always visible in header)
   */
  get firstCardCommand(): Locator {
    return this.container.getByTestId('query-card-command').first();
  }

  /**
   * Get the result body of the first card (only visible when expanded).
   * Matches either the plugin result or the CLI result wrapper.
   */
  get firstCardResult(): Locator {
    return this.container
      .locator('[data-testid="query-plugin-result"], [data-testid="query-cli-result-wrapper"]')
      .first();
  }
}
