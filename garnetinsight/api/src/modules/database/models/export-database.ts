import { PickType } from '@nestjs/swagger';
import { Database } from './database';

export class ExportDatabase extends PickType(Database, [
  'id',
  'host',
  'port',
  'name',
  'db',
  'username',
  'password',
  'connectionType',
  'nameFromProvider',
  'provider',
  'lastConnection',
  'sentinelMaster',
  'modules',
  'tls',
  'tlsServername',
  'verifyServerCert',
  'caCert',
  'clientCert',
  'ssh',
  'sshOptions',
  'compressor',
  'forceStandalone',
  'tags',
] as const) {}
