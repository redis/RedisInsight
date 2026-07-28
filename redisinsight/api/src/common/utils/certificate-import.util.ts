import { parse } from 'path';
import { readFileSync } from 'fs';
import config, { Config } from 'src/utils/config';
import { BuildType } from 'src/modules/server/models/server';

const SERVER_CONFIG = config.get('server') as Config['server'];

// Only the desktop app resolves a path; other builds take inline PEM only,
// so an import can't read files off the host.
export const isImportFromFileAllowed = (): boolean =>
  SERVER_CONFIG.buildType === BuildType.Electron;

export const isValidPemCertificate = (cert: string): boolean =>
  cert.startsWith('-----BEGIN CERTIFICATE-----');
export const isValidPemPrivateKey = (cert: string): boolean =>
  cert.startsWith('-----BEGIN PRIVATE KEY-----');
export const isValidSshPrivateKey = (cert: string): boolean =>
  cert.startsWith('-----BEGIN OPENSSH PRIVATE KEY-----');
export const getPemBodyFromFileSync = (path: string): string =>
  readFileSync(path).toString('utf8');
export const getCertNameFromFilename = (path: string): string =>
  parse(path).name;
