import { MigrationInterface, QueryRunner } from 'typeorm';

export class Environment1779000000000 implements MigrationInterface {
  name = 'Environment1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" ADD COLUMN "environment" varchar NOT NULL DEFAULT ('unspecified')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" DROP COLUMN "environment"`,
    );
  }
}
