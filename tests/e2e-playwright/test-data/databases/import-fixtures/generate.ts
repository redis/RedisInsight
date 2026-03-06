import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { redisConfig } from 'e2eSrc/config';

const { host, port } = redisConfig.standalone;

interface ImportFixture {
  host: string;
  port: number;
  name: string;
  connectionType?: string;
  tags?: Array<{ key: string; value: string }>;
}

function writeTempFixture(filename: string, data: unknown): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ri-import-'));
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  return filePath;
}

export function generateValidSingle(name = 'test-import-single'): string {
  const data: ImportFixture[] = [
    { host, port, name, connectionType: 'STANDALONE' },
  ];
  return writeTempFixture('valid-single.json', data);
}

export function generateValidMultiple(
  names = ['test-import-multi-1', 'test-import-multi-2'],
): string {
  const data: ImportFixture[] = names.map((n) => ({
    host,
    port,
    name: n,
    connectionType: 'STANDALONE',
  }));
  return writeTempFixture('valid-multiple.json', data);
}

export function generatePartialValid(
  validName = 'test-import-partial-ok',
  failName = 'test-import-partial-fail',
): string {
  const data = [
    { host, port, name: validName, connectionType: 'STANDALONE' },
    {
      host: 'invalid-host-that-will-never-resolve.example.com',
      port: 65535,
      name: failName,
    },
  ];
  return writeTempFixture('partial-valid.json', data);
}

export function generateWithTags(name = 'test-import-tagged'): string {
  const data: ImportFixture[] = [
    {
      host,
      port,
      name,
      connectionType: 'STANDALONE',
      tags: [
        { key: 'env', value: 'test' },
        { key: 'team', value: 'qa' },
      ],
    },
  ];
  return writeTempFixture('with-tags.json', data);
}
