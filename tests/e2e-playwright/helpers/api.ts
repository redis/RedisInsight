import { request, APIRequestContext } from '@playwright/test';
import { AddDatabaseConfig, DatabaseInstance } from 'e2eSrc/types';
import { TEST_DB_PREFIX } from 'e2eSrc/test-data/databases';

/**
 * API Helper for database operations
 * Used for test setup/teardown to avoid slow UI interactions
 */
export class ApiHelper {
  private context: APIRequestContext | null = null;
  private readonly apiUrl: string;

  constructor(options: { apiUrl: string }) {
    this.apiUrl = options.apiUrl;
  }

  private async getContext(): Promise<APIRequestContext> {
    if (!this.context) {
      this.context = await request.newContext({
        baseURL: this.apiUrl,
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
   * Create a String key via API
   */
  async createStringKey(databaseId: string, keyName: string, value: string): Promise<void> {
    const ctx = await this.getContext();
    const response = await ctx.post(`/api/databases/${databaseId}/string`, {
      data: { keyName, value },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to create string key: ${response.status()} - ${body}`);
    }
  }

  /**
   * Create a Hash key via API
   */
  async createHashKey(databaseId: string, keyName: string, fields: { field: string; value: string }[]): Promise<void> {
    const ctx = await this.getContext();
    const response = await ctx.post(`/api/databases/${databaseId}/hash`, {
      data: { keyName, fields },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to create hash key: ${response.status()} - ${body}`);
    }
  }

  /**
   * Create a List key via API
   * Uses the POST /list endpoint with elements array
   */
  async createListKey(databaseId: string, keyName: string, elements: string[]): Promise<void> {
    const ctx = await this.getContext();
    const response = await ctx.post(`/api/databases/${databaseId}/list`, {
      data: { keyName, elements, destination: 'TAIL' },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to create list key: ${response.status()} - ${body}`);
    }
  }

  /**
   * Create a Set key via API
   */
  async createSetKey(databaseId: string, keyName: string, members: string[]): Promise<void> {
    const ctx = await this.getContext();
    const response = await ctx.post(`/api/databases/${databaseId}/set`, {
      data: { keyName, members },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to create set key: ${response.status()} - ${body}`);
    }
  }

  /**
   * Create a Sorted Set (ZSet) key via API
   * Uses the POST /zSet endpoint with members array containing {name, score}
   */
  async createZSetKey(databaseId: string, keyName: string, members: { member: string; score: string }[]): Promise<void> {
    const ctx = await this.getContext();
    const response = await ctx.post(`/api/databases/${databaseId}/zSet`, {
      data: { keyName, members: members.map((m) => ({ name: m.member, score: parseFloat(m.score) })) },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to create zset key: ${response.status()} - ${body}`);
    }
  }

  /**
   * Create a Stream key via API
   * Uses the POST /streams endpoint with entries array containing {id, fields}
   * Fields should be {name, value} pairs
   */
  async createStreamKey(
    databaseId: string,
    keyName: string,
    fields: { field: string; value: string }[],
    entryId: string = '*',
  ): Promise<void> {
    const ctx = await this.getContext();
    // Convert field/value to name/value format expected by API
    const formattedFields = fields.map((f) => ({ name: f.field, value: f.value }));
    const response = await ctx.post(`/api/databases/${databaseId}/streams`, {
      data: { keyName, entries: [{ id: entryId, fields: formattedFields }] },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to create stream key: ${response.status()} - ${body}`);
    }
  }

  /**
   * Create a JSON key via API
   */
  async createJsonKey(databaseId: string, keyName: string, value: string): Promise<void> {
    const ctx = await this.getContext();
    const response = await ctx.post(`/api/databases/${databaseId}/rejson-rl`, {
      data: { keyName, data: value },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to create json key: ${response.status()} - ${body}`);
    }
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
   * Get current app settings
   */
  async getSettings(): Promise<{
    agreements: {
      eula: boolean;
      analytics: boolean;
      encryption: boolean;
      notifications: boolean;
      version: string;
    } | null;
  }> {
    const ctx = await this.getContext();
    const response = await ctx.get('/api/settings');

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to get settings: ${response.status()} - ${body}`);
    }

    return response.json();
  }

  /**
   * Reset agreements to trigger EULA popup
   */
  async resetAgreements(): Promise<void> {
    const ctx = await this.getContext();
    const response = await ctx.delete('/api/settings/agreements');

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to reset agreements: ${response.status()} - ${body}`);
    }
  }

  /**
   * Accept EULA and set agreements via API
   */
  async acceptEula(options?: {
    analytics?: boolean;
    encryption?: boolean;
    notifications?: boolean;
  }): Promise<void> {
    const ctx = await this.getContext();
    const response = await ctx.patch('/api/settings', {
      data: {
        agreements: {
          eula: true,
          analytics: options?.analytics ?? false,
          encryption: options?.encryption ?? true,
          notifications: options?.notifications ?? false,
        },
      },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to accept EULA: ${response.status()} - ${body}`);
    }
  }

  /**
   * Ensure EULA is accepted (check first, accept if needed)
   */
  async ensureEulaAccepted(): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.agreements || !settings.agreements.eula) {
      await this.acceptEula();
    }
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
