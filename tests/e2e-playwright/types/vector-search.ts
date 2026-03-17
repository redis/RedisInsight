/**
 * RediSearch index field schema
 */
export interface IndexSchemaField {
  name: string;
  type: string;
}

/**
 * Configuration for creating a RediSearch index via API
 */
export interface IndexConfig {
  indexName: string;
  prefix: string;
  schema: IndexSchemaField[];
  keyType?: 'hash' | 'json';
}

/**
 * Hash key data shaped for vector search index creation tests
 */
export interface IndexHashKeyData {
  keyName: string;
  fields: Array<{ field: string; value: string }>;
}

/**
 * JSON key data shaped for vector search index creation tests
 */
export interface IndexJsonKeyData {
  keyName: string;
  value: Record<string, unknown>;
}
