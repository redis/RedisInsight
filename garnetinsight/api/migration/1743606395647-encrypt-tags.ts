import { MigrationInterface, QueryRunner } from 'typeorm';

export class EncryptTags1743606395647 implements MigrationInterface {
  name = 'EncryptTags1743606395647';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_tag" ("id" varchar PRIMARY KEY NOT NULL, "key" varchar NOT NULL, "value" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "encryption" varchar, CONSTRAINT "UQ_5d6110d4eee64a5a4529ea8fcdc" UNIQUE ("key", "value"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_tag"("id", "key", "value", "createdAt", "updatedAt") SELECT "id", "key", "value", "createdAt", "updatedAt" FROM "tag"`,
    );
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`ALTER TABLE "temporary_tag" RENAME TO "tag"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tag" RENAME TO "temporary_tag"`);
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" varchar PRIMARY KEY NOT NULL, "key" varchar NOT NULL, "value" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_5d6110d4eee64a5a4529ea8fcdc" UNIQUE ("key", "value"))`,
    );
    await queryRunner.query(
      `INSERT INTO "tag"("id", "key", "value", "createdAt", "updatedAt") SELECT "id", "key", "value", "createdAt", "updatedAt" FROM "temporary_tag"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_tag"`);
  }
}
