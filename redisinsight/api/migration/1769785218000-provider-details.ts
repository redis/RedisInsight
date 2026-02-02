import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProviderDetails1769785218000 implements MigrationInterface {
  name = 'ProviderDetails1769785218000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" ADD COLUMN "providerDetails" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" DROP COLUMN "providerDetails"`,
    );
  }
}

