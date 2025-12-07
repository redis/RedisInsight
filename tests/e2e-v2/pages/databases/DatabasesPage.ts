import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { AddDatabaseDialog } from './components/AddDatabaseDialog';
import { CloneDatabaseDialog } from './components/CloneDatabaseDialog';
import { DatabaseList } from './components/DatabaseList';
import { ImportDatabaseDialog } from './components/ImportDatabaseDialog';
import { AddDatabaseConfig } from '../../types';

/**
 * Page Object for the Databases List page
 * Composes smaller component POMs for better maintainability
 */
export class DatabasesPage extends BasePage {
  // Component POMs
  readonly addDatabaseDialog: AddDatabaseDialog;
  readonly cloneDatabaseDialog: CloneDatabaseDialog;
  readonly databaseList: DatabaseList;
  readonly importDatabaseDialog: ImportDatabaseDialog;

  // Page-level elements
  readonly connectDatabaseButton: Locator;
  readonly createCloudDatabaseButton: Locator;
  readonly importFromFileButton: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize component POMs
    this.addDatabaseDialog = new AddDatabaseDialog(page);
    this.cloneDatabaseDialog = new CloneDatabaseDialog(page);
    this.databaseList = new DatabaseList(page);
    this.importDatabaseDialog = new ImportDatabaseDialog(page);

    // Page-level elements
    this.connectDatabaseButton = page.getByTestId('add-redis-database-short');
    this.createCloudDatabaseButton = page.getByRole('button', { name: /create free cloud database/i });
    this.importFromFileButton = page.getByTestId('option-btn-import');
  }

  /**
   * Navigate to the databases page
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  /**
   * Open the Add Database dialog
   */
  async openAddDatabaseDialog(): Promise<void> {
    await this.connectDatabaseButton.click();
  }

  /**
   * Add a database - convenience method that combines dialog open + form fill
   */
  async addDatabase(config: AddDatabaseConfig): Promise<void> {
    await this.openAddDatabaseDialog();
    await this.addDatabaseDialog.addDatabase(config);
  }

  /**
   * Open the Import from file dialog
   */
  async openImportDialog(): Promise<void> {
    await this.openAddDatabaseDialog();
    await this.importFromFileButton.click();
  }

  /**
   * Import databases from file - full flow
   */
  async importDatabasesFromFile(filePath: string): Promise<{ success: number; failed: number }> {
    await this.openImportDialog();
    return this.importDatabaseDialog.importFile(filePath);
  }

  // Delegate common operations to components for backward compatibility

  /**
   * Get a database row by name
   * @deprecated Use databaseList.getRow() instead
   */
  getDatabaseRow(name: string): Locator {
    return this.databaseList.getRow(name);
  }

  /**
   * Delete a database by name
   * @deprecated Use databaseList.delete() instead
   */
  async deleteDatabase(name: string): Promise<void> {
    await this.databaseList.delete(name);
  }

  /**
   * Check if a database exists
   * @deprecated Use databaseList.exists() instead
   */
  async databaseExists(name: string): Promise<boolean> {
    return this.databaseList.exists(name);
  }
}
