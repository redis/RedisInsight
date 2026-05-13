import { MigrationInterface, QueryRunner } from 'typeorm';

export class DatabaseIsProduction1778758000000 implements MigrationInterface {
  name = 'DatabaseIsProduction1778758000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" ADD COLUMN "isProduction" boolean DEFAULT (0)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" DROP COLUMN "isProduction"`,
    );
  }
}
