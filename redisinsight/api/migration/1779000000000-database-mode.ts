import { MigrationInterface, QueryRunner } from 'typeorm';

export class DatabaseMode1779000000000 implements MigrationInterface {
  name = 'DatabaseMode1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" ADD COLUMN "databaseMode" varchar DEFAULT ('unmarked')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" DROP COLUMN "databaseMode"`,
    );
  }
}
