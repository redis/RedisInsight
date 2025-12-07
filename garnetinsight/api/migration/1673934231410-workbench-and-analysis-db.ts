import { MigrationInterface, QueryRunner } from 'typeorm';

export class workbenchAndAnalysisDbIndex1673934231410
  implements MigrationInterface
{
  name = 'workbenchAndAnalysisDbIndex1673934231410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_5cd90dd6def1fd7c521e53fb2c"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_command_execution" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "command" text NOT NULL, "result" text NOT NULL, "role" varchar, "nodeOptions" varchar, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "mode" varchar, "resultsMode" varchar, "summary" varchar, "executionTime" integer, "db" integer, CONSTRAINT "FK_ea8adfe9aceceb79212142206b8" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_command_execution"("id", "databaseId", "command", "result", "role", "nodeOptions", "encryption", "createdAt", "mode", "resultsMode", "summary", "executionTime") SELECT "id", "databaseId", "command", "result", "role", "nodeOptions", "encryption", "createdAt", "mode", "resultsMode", "summary", "executionTime" FROM "command_execution"`,
    );
    await queryRunner.query(`DROP TABLE "command_execution"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_command_execution" RENAME TO "command_execution"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5cd90dd6def1fd7c521e53fb2c" ON "command_execution" ("createdAt") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_d174a8edc2201d6c5781f0126a"`);
    await queryRunner.query(`DROP INDEX "IDX_fdd0daeb4d8f226cf1ff79bebb"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_database_analysis" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "filter" blob, "delimiter" varchar NOT NULL, "progress" blob, "totalKeys" blob, "totalMemory" blob, "topKeysNsp" blob, "topMemoryNsp" blob, "topKeysLength" blob, "topKeysMemory" blob, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "expirationGroups" blob, "db" integer, CONSTRAINT "FK_d174a8edc2201d6c5781f0126ae" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_database_analysis"("id", "databaseId", "filter", "delimiter", "progress", "totalKeys", "totalMemory", "topKeysNsp", "topMemoryNsp", "topKeysLength", "topKeysMemory", "encryption", "createdAt", "expirationGroups") SELECT "id", "databaseId", "filter", "delimiter", "progress", "totalKeys", "totalMemory", "topKeysNsp", "topMemoryNsp", "topKeysLength", "topKeysMemory", "encryption", "createdAt", "expirationGroups" FROM "database_analysis"`,
    );
    await queryRunner.query(`DROP TABLE "database_analysis"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_database_analysis" RENAME TO "database_analysis"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d174a8edc2201d6c5781f0126a" ON "database_analysis" ("databaseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fdd0daeb4d8f226cf1ff79bebb" ON "database_analysis" ("createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_fdd0daeb4d8f226cf1ff79bebb"`);
    await queryRunner.query(`DROP INDEX "IDX_d174a8edc2201d6c5781f0126a"`);
    await queryRunner.query(
      `ALTER TABLE "database_analysis" RENAME TO "temporary_database_analysis"`,
    );
    await queryRunner.query(
      `CREATE TABLE "database_analysis" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "filter" blob, "delimiter" varchar NOT NULL, "progress" blob, "totalKeys" blob, "totalMemory" blob, "topKeysNsp" blob, "topMemoryNsp" blob, "topKeysLength" blob, "topKeysMemory" blob, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "expirationGroups" blob, CONSTRAINT "FK_d174a8edc2201d6c5781f0126ae" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "database_analysis"("id", "databaseId", "filter", "delimiter", "progress", "totalKeys", "totalMemory", "topKeysNsp", "topMemoryNsp", "topKeysLength", "topKeysMemory", "encryption", "createdAt", "expirationGroups") SELECT "id", "databaseId", "filter", "delimiter", "progress", "totalKeys", "totalMemory", "topKeysNsp", "topMemoryNsp", "topKeysLength", "topKeysMemory", "encryption", "createdAt", "expirationGroups" FROM "temporary_database_analysis"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_database_analysis"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_fdd0daeb4d8f226cf1ff79bebb" ON "database_analysis" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d174a8edc2201d6c5781f0126a" ON "database_analysis" ("databaseId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_5cd90dd6def1fd7c521e53fb2c"`);
    await queryRunner.query(
      `ALTER TABLE "command_execution" RENAME TO "temporary_command_execution"`,
    );
    await queryRunner.query(
      `CREATE TABLE "command_execution" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "command" text NOT NULL, "result" text NOT NULL, "role" varchar, "nodeOptions" varchar, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "mode" varchar, "resultsMode" varchar, "summary" varchar, "executionTime" integer, CONSTRAINT "FK_ea8adfe9aceceb79212142206b8" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "command_execution"("id", "databaseId", "command", "result", "role", "nodeOptions", "encryption", "createdAt", "mode", "resultsMode", "summary", "executionTime") SELECT "id", "databaseId", "command", "result", "role", "nodeOptions", "encryption", "createdAt", "mode", "resultsMode", "summary", "executionTime" FROM "temporary_command_execution"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_command_execution"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_5cd90dd6def1fd7c521e53fb2c" ON "command_execution" ("createdAt") `,
    );
  }
}
