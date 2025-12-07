import { MigrationInterface, QueryRunner } from 'typeorm';

export class serverInfo1626086601057 implements MigrationInterface {
  name = 'serverInfo1626086601057';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "server" ("id" varchar PRIMARY KEY NOT NULL, "createDateTime" datetime NOT NULL DEFAULT (datetime('now')))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "server"`);
  }
}
