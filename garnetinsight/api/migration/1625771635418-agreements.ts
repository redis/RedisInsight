import { MigrationInterface, QueryRunner } from 'typeorm';

export class agreements1625771635418 implements MigrationInterface {
  name = 'agreements1625771635418';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "agreements" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "version" varchar, "data" varchar)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "agreements"`);
  }
}
