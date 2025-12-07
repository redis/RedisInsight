import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbSettings1737362130798 implements MigrationInterface {
  name = 'DbSettings1737362130798';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "database_settings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "databaseId" varchar NOT NULL, "data" varchar, CONSTRAINT "REL_548c7a02b802a053a80a60bdc9" UNIQUE ("databaseId"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_548c7a02b802a053a80a60bdc9" ON "database_settings" ("databaseId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_548c7a02b802a053a80a60bdc9"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_database_settings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "databaseId" varchar NOT NULL, "data" varchar, CONSTRAINT "REL_548c7a02b802a053a80a60bdc9" UNIQUE ("databaseId"), CONSTRAINT "FK_548c7a02b802a053a80a60bdc96" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_database_settings"("id", "databaseId", "data") SELECT "id", "databaseId", "data" FROM "database_settings"`,
    );
    await queryRunner.query(`DROP TABLE "database_settings"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_database_settings" RENAME TO "database_settings"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_548c7a02b802a053a80a60bdc9" ON "database_settings" ("databaseId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_548c7a02b802a053a80a60bdc9"`);
    await queryRunner.query(
      `ALTER TABLE "database_settings" RENAME TO "temporary_database_settings"`,
    );
    await queryRunner.query(
      `CREATE TABLE "database_settings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "databaseId" varchar NOT NULL, "data" varchar, CONSTRAINT "REL_548c7a02b802a053a80a60bdc9" UNIQUE ("databaseId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "database_settings"("id", "databaseId", "data") SELECT "id", "databaseId", "data" FROM "temporary_database_settings"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_database_settings"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_548c7a02b802a053a80a60bdc9" ON "database_settings" ("databaseId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_548c7a02b802a053a80a60bdc9"`);
    await queryRunner.query(`DROP TABLE "database_settings"`);
  }
}
