import { request, APIRequestContext } from '@playwright/test';
import { appConfig } from '../config';
import { AddDatabaseConfig, DatabaseInstance } from '../types';
import { TEST_DB_PREFIX } from '../test-data/databases';

/**
 * API Helper for database operations
 * Used for test setup/teardown to avoid slow UI interactions
 */
export class ApiHelper {
  private context: APIRequestContext | null = null;

  private async getContext(): Promise<APIRequestContext> {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: appConfig.apiUrl,
      });
    }
    return this.context;
  }

  /**
   * Create a database via API
   */
  async createDatabase(config: AddDatabaseConfig): Promise<DatabaseInstance> {
    const ctx = await this.getContext();
    const response = await ctx.post('/api/databases', {
      data: {
        name: config.name,
        host: config.host,
        port: config.port,
        username: config.username || null,
        password: config.password || null,
        db: config.db ?? 0,
      },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to create database: ${response.status()} - ${body}`);
    }

    return response.json();
  }

  /**
   * Delete a database by ID
   */
  async deleteDatabase(id: string): Promise<void> {
    const ctx = await this.getContext();
    const response = await ctx.delete(`/api/databases/${id}`);

    if (!response.ok() && response.status() !== 404) {
      const body = await response.text();
      throw new Error(`Failed to delete database: ${response.status()} - ${body}`);
    }
  }

  /**
   * Get all databases
   */
  async getDatabases(): Promise<DatabaseInstance[]> {
    const ctx = await this.getContext();
    const response = await ctx.get('/api/databases');

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to get databases: ${response.status()} - ${body}`);
    }

    return response.json();
  }

  /**
   * Get a database by ID
   */
  async getDatabase(id: string): Promise<DatabaseInstance | null> {
    const ctx = await this.getContext();
    const response = await ctx.get(`/api/databases/${id}`);

    if (response.status() === 404) {
      return null;
    }

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to get database: ${response.status()} - ${body}`);
    }

    return response.json();
  }

  /**
   * Delete databases matching a name pattern
   * Useful for cleanup of test databases
   */
  async deleteDatabasesByPattern(pattern: RegExp): Promise<number> {
    const databases = await this.getDatabases();
    const matching = databases.filter((db) => pattern.test(db.name));

    for (const db of matching) {
      await this.deleteDatabase(db.id);
    }

    return matching.length;
  }

  /**
   * Delete all test databases (names starting with TEST_DB_PREFIX)
   */
  async deleteTestDatabases(): Promise<number> {
    return this.deleteDatabasesByPattern(new RegExp(`^${TEST_DB_PREFIX}`));
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
      this.context = null;
    }
  }
}
