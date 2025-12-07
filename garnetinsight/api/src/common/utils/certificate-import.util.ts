import { parse } from 'path';
import { readFileSync } from 'fs';

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
