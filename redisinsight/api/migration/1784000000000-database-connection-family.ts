import { MigrationInterface, QueryRunner } from 'typeorm';

export class DatabaseConnectionFamily1784000000000
  implements MigrationInterface
{
  name = 'DatabaseConnectionFamily1784000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" ADD COLUMN "connectionFamily" varchar NOT NULL DEFAULT ('auto')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" DROP COLUMN "connectionFamily"`,
    );
  }
}
