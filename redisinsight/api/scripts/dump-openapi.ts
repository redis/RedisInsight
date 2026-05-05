/* eslint-disable no-console */
import 'reflect-metadata';
import 'dotenv/config';
import * as path from 'path';
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

import { AppModule } from '../src/app.module';
import SWAGGER_CONFIG from '../config/swagger';

/**
 * Boots the Nest application **without** listening on a port and serializes the
 * Swagger document to `redisinsight/api/openapi.json`.
 *
 * Used by the `generate:openapi-spec` script (which feeds `openapi-generator-cli`).
 * Keep the bootstrap logic here as small as possible: the goal is a deterministic
 * spec dump that does not rely on any runtime side-effects of `main.ts` (folder
 * migrations, log file providers, websocket adapters, etc.).
 */
async function dumpOpenApi(): Promise<void> {
  process.env.RI_AUTO_BOOTSTRAP = 'false';

  const logger = new Logger('dump-openapi');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
    abortOnError: false,
  });

  await app.init();

  const document = SwaggerModule.createDocument(app, SWAGGER_CONFIG);

  const outFile = path.resolve(__dirname, '..', 'openapi.json');
  fs.writeFileSync(outFile, JSON.stringify(document, null, 2));
  logger.log(`OpenAPI spec written to ${outFile}`);

  await app.close();
}

dumpOpenApi()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[dump-openapi] failed to dump OpenAPI spec:', err);
    process.exit(1);
  });
