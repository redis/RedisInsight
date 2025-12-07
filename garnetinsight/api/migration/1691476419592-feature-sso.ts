import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeatureSso1691476419592 implements MigrationInterface {
  name = 'FeatureSso1691476419592';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_features" ("name" varchar PRIMARY KEY NOT NULL, "flag" boolean NOT NULL, "strategy" varchar, "data" text)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_features"("name", "flag") SELECT "name", "flag" FROM "features"`,
    );
    await queryRunner.query(`DROP TABLE "features"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_features" RENAME TO "features"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "features" RENAME TO "temporary_features"`,
    );
    await queryRunner.query(
      `CREATE TABLE "features" ("name" varchar PRIMARY KEY NOT NULL, "flag" boolean NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "features"("name", "flag") SELECT "name", "flag" FROM "temporary_features"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_features"`);
  }
}
