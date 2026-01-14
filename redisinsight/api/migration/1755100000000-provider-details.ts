import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProviderDetails1755100000000 implements MigrationInterface {
  name = 'ProviderDetails1755100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" ADD "providerDetails" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" DROP COLUMN "providerDetails"`,
    );
  }
}

