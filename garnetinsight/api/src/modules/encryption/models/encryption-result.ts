export enum EncryptionStrategy {
  PLAIN = 'PLAIN',
  KEYTAR = 'KEYTAR',
  KEY = 'KEY',
}

export class EncryptionResult {
  encryption?: EncryptionStrategy;

  data: string;
}
