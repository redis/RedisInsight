import { MigrationInterface, QueryRunner } from 'typeorm';

export class AiHistorySteps1714501203616 implements MigrationInterface {
  name = 'Migration1714501203616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_5c051504f4efe6f20c5a7f64f6"`);
    await queryRunner.query(`DROP INDEX "IDX_f0a6e0873ac71f323e9880b4a8"`);
    await queryRunner.query(`DROP INDEX "IDX_51d5d60bfc249e9a20443376e1"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_ai_query_message" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "accountId" varchar NOT NULL, "type" varchar NOT NULL, "content" blob NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "encryption" varchar, "steps" blob)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_ai_query_message"("id", "databaseId", "accountId", "type", "content", "createdAt", "encryption") SELECT "id", "databaseId", "accountId", "type", "content", "createdAt", "encryption" FROM "ai_query_message"`,
    );
    await queryRunner.query(`DROP TABLE "ai_query_message"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_ai_query_message" RENAME TO "ai_query_message"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5c051504f4efe6f20c5a7f64f6" ON "ai_query_message" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f0a6e0873ac71f323e9880b4a8" ON "ai_query_message" ("accountId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51d5d60bfc249e9a20443376e1" ON "ai_query_message" ("databaseId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_51d5d60bfc249e9a20443376e1"`);
    await queryRunner.query(`DROP INDEX "IDX_f0a6e0873ac71f323e9880b4a8"`);
    await queryRunner.query(`DROP INDEX "IDX_5c051504f4efe6f20c5a7f64f6"`);
    await queryRunner.query(
      `ALTER TABLE "ai_query_message" RENAME TO "temporary_ai_query_message"`,
    );
    await queryRunner.query(
      `CREATE TABLE "ai_query_message" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "accountId" varchar NOT NULL, "type" varchar NOT NULL, "content" blob NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "encryption" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "ai_query_message"("id", "databaseId", "accountId", "type", "content", "createdAt", "encryption") SELECT "id", "databaseId", "accountId", "type", "content", "createdAt", "encryption" FROM "temporary_ai_query_message"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_ai_query_message"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_51d5d60bfc249e9a20443376e1" ON "ai_query_message" ("databaseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f0a6e0873ac71f323e9880b4a8" ON "ai_query_message" ("accountId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5c051504f4efe6f20c5a7f64f6" ON "ai_query_message" ("createdAt") `,
    );
  }
}
