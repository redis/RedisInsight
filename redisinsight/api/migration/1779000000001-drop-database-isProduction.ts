import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropDatabaseIsProduction1779000000001
  implements MigrationInterface
{
  name = 'DropDatabaseIsProduction1779000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" DROP COLUMN "isProduction"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" ADD COLUMN "isProduction" boolean DEFAULT (0)`,
    );
  }
}
