import { MigrationInterface, QueryRunner } from 'typeorm';

export class customTutorials1677135091633 implements MigrationInterface {
  name = 'customTutorials1677135091633';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "custom_tutorials" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "link" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "custom_tutorials"`);
  }
}
