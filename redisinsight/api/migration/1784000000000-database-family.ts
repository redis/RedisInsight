import { MigrationInterface, QueryRunner } from 'typeorm';

export class DatabaseFamily1784000000000 implements MigrationInterface {
  name = 'DatabaseFamily1784000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" ADD COLUMN "family" varchar NOT NULL DEFAULT ('auto')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" DROP COLUMN "family"`,
    );
  }
}
