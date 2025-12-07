import { MigrationInterface, QueryRunner } from 'typeorm';

export class databaseAnalysis1664785208236 implements MigrationInterface {
  name = 'databaseAnalysis1664785208236';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "database_analysis" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "filter" blob, "delimiter" varchar NOT NULL, "progress" blob, "totalKeys" blob, "totalMemory" blob, "topKeysNsp" blob, "topMemoryNsp" blob, "topKeysLength" blob, "topKeysMemory" blob, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d174a8edc2201d6c5781f0126a" ON "database_analysis" ("databaseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fdd0daeb4d8f226cf1ff79bebb" ON "database_analysis" ("createdAt") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_d174a8edc2201d6c5781f0126a"`);
    await queryRunner.query(`DROP INDEX "IDX_fdd0daeb4d8f226cf1ff79bebb"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_database_analysis" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "filter" blob, "delimiter" varchar NOT NULL, "progress" blob, "totalKeys" blob, "totalMemory" blob, "topKeysNsp" blob, "topMemoryNsp" blob, "topKeysLength" blob, "topKeysMemory" blob, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_d174a8edc2201d6c5781f0126ae" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_database_analysis"("id", "databaseId", "filter", "delimiter", "progress", "totalKeys", "totalMemory", "topKeysNsp", "topMemoryNsp", "topKeysLength", "topKeysMemory", "encryption", "createdAt") SELECT "id", "databaseId", "filter", "delimiter", "progress", "totalKeys", "totalMemory", "topKeysNsp", "topMemoryNsp", "topKeysLength", "topKeysMemory", "encryption", "createdAt" FROM "database_analysis"`,
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
      `CREATE TABLE "database_analysis" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "filter" blob, "delimiter" varchar NOT NULL, "progress" blob, "totalKeys" blob, "totalMemory" blob, "topKeysNsp" blob, "topMemoryNsp" blob, "topKeysLength" blob, "topKeysMemory" blob, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `INSERT INTO "database_analysis"("id", "databaseId", "filter", "delimiter", "progress", "totalKeys", "totalMemory", "topKeysNsp", "topMemoryNsp", "topKeysLength", "topKeysMemory", "encryption", "createdAt") SELECT "id", "databaseId", "filter", "delimiter", "progress", "totalKeys", "totalMemory", "topKeysNsp", "topMemoryNsp", "topKeysLength", "topKeysMemory", "encryption", "createdAt" FROM "temporary_database_analysis"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_database_analysis"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_fdd0daeb4d8f226cf1ff79bebb" ON "database_analysis" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d174a8edc2201d6c5781f0126a" ON "database_analysis" ("databaseId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_fdd0daeb4d8f226cf1ff79bebb"`);
    await queryRunner.query(`DROP INDEX "IDX_d174a8edc2201d6c5781f0126a"`);
    await queryRunner.query(`DROP TABLE "database_analysis"`);
  }
}
