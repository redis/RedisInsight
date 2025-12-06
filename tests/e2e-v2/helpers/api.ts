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
   * Delete keys matching a pattern in a database
   * Uses SCAN + DEL to avoid blocking
   */
  async deleteKeysByPattern(databaseId: string, pattern: string): Promise<number> {
    const ctx = await this.getContext();

    // First, scan for keys matching the pattern
    const scanResponse = await ctx.post(`/api/databases/${databaseId}/keys`, {
      data: {
        cursor: '0',
        count: 10000,
        match: pattern,
      },
    });

    if (!scanResponse.ok()) {
      // If scan fails, it might be because there are no keys - that's OK
      return 0;
    }

    const scanResult = await scanResponse.json();
    const keys = scanResult.keys || [];

    if (keys.length === 0) {
      return 0;
    }

    // Delete the keys
    const keyNames = keys.map((k: { name: string }) => k.name);
    const deleteResponse = await ctx.delete(`/api/databases/${databaseId}/keys`, {
      data: { keys: keyNames },
    });

    if (!deleteResponse.ok()) {
      // Ignore delete errors - keys might already be gone
      return 0;
    }

    return keyNames.length;
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
