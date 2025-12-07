import { MigrationInterface, QueryRunner } from 'typeorm';

export class RdiOptionalAuth1740579711635 implements MigrationInterface {
  name = 'RdiOptionalAuth1740579711635';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_rdi" ("id" varchar PRIMARY KEY NOT NULL, "url" varchar, "name" varchar NOT NULL, "username" varchar, "password" varchar, "lastConnection" datetime, "version" varchar NOT NULL, "encryption" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_rdi"("id", "url", "name", "username", "password", "lastConnection", "version", "encryption") SELECT "id", "url", "name", "username", "password", "lastConnection", "version", "encryption" FROM "rdi"`,
    );
    await queryRunner.query(`DROP TABLE "rdi"`);
    await queryRunner.query(`ALTER TABLE "temporary_rdi" RENAME TO "rdi"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rdi" RENAME TO "temporary_rdi"`);
    await queryRunner.query(
      `CREATE TABLE "rdi" ("id" varchar PRIMARY KEY NOT NULL, "url" varchar, "name" varchar NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "lastConnection" datetime, "version" varchar NOT NULL, "encryption" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "rdi"("id", "url", "name", "username", "password", "lastConnection", "version", "encryption") SELECT "id", "url", "name", "username", "password", "lastConnection", "version", "encryption" FROM "temporary_rdi"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_rdi"`);
  }
}
