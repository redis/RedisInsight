import { MigrationInterface, QueryRunner } from 'typeorm';

export class CloudSession1729085495444 implements MigrationInterface {
  name = 'CloudSession1729085495444';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cloud_session" ("id" varchar PRIMARY KEY NOT NULL, "data" varchar, "encryption" varchar)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "cloud_session"`);
  }
}
