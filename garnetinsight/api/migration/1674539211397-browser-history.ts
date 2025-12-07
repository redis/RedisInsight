import { MigrationInterface, QueryRunner } from 'typeorm';

export class browserHistory1674539211397 implements MigrationInterface {
  name = 'browserHistory1674539211397';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "browser_history" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "filter" blob, "mode" varchar, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0fb08df31bf1a930aeb4d8862" ON "browser_history" ("databaseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f3780aa1d0b977219e40db27e0" ON "browser_history" ("createdAt") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_d0fb08df31bf1a930aeb4d8862"`);
    await queryRunner.query(`DROP INDEX "IDX_f3780aa1d0b977219e40db27e0"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_browser_history" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "filter" blob, "mode" varchar, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_d0fb08df31bf1a930aeb4d8862e" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_browser_history"("id", "databaseId", "filter", "mode", "encryption", "createdAt") SELECT "id", "databaseId", "filter", "mode", "encryption", "createdAt" FROM "browser_history"`,
    );
    await queryRunner.query(`DROP TABLE "browser_history"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_browser_history" RENAME TO "browser_history"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0fb08df31bf1a930aeb4d8862" ON "browser_history" ("databaseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f3780aa1d0b977219e40db27e0" ON "browser_history" ("createdAt") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_f3780aa1d0b977219e40db27e0"`);
    await queryRunner.query(`DROP INDEX "IDX_d0fb08df31bf1a930aeb4d8862"`);
    await queryRunner.query(
      `ALTER TABLE "browser_history" RENAME TO "temporary_browser_history"`,
    );
    await queryRunner.query(
      `CREATE TABLE "browser_history" ("id" varchar PRIMARY KEY NOT NULL, "databaseId" varchar NOT NULL, "filter" blob, "mode" varchar, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
    await queryRunner.query(
      `INSERT INTO "browser_history"("id", "databaseId", "filter", "mode", "encryption", "createdAt") SELECT "id", "databaseId", "filter", "mode", "encryption", "createdAt" FROM "temporary_browser_history"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_browser_history"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_f3780aa1d0b977219e40db27e0" ON "browser_history" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0fb08df31bf1a930aeb4d8862" ON "browser_history" ("databaseId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_f3780aa1d0b977219e40db27e0"`);
    await queryRunner.query(`DROP INDEX "IDX_d0fb08df31bf1a930aeb4d8862"`);
    await queryRunner.query(`DROP TABLE "browser_history"`);
  }
}
