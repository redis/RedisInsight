/**
 * Redis key types
 */
export type KeyType = 'Hash' | 'List' | 'Set' | 'Sorted Set' | 'String' | 'JSON' | 'Stream';

/**
 * Key data for creating keys
 */
export interface BaseKeyData {
  keyName: string;
  ttl?: string;
}

export interface StringKeyData extends BaseKeyData {
  value: string;
}

export interface HashKeyData extends BaseKeyData {
  fields: Array<{ field: string; value: string }>;
}

export interface ListKeyData extends BaseKeyData {
  elements: string[];
}

export interface SetKeyData extends BaseKeyData {
  members: string[];
}

export interface ZSetKeyData extends BaseKeyData {
  members: Array<{ member: string; score: string }>;
}

export interface StreamKeyData extends BaseKeyData {
  entryId?: string;
  fields: Array<{ field: string; value: string }>;
}

export interface JsonKeyData extends BaseKeyData {
  value: string;
}

export type KeyData =
  | StringKeyData
  | HashKeyData
  | ListKeyData
  | SetKeyData
  | ZSetKeyData
  | StreamKeyData
  | JsonKeyData;

