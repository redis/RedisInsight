import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Defensive normalization for the `databaseMode` column.
 *
 * Dev environments running with `synchronize: true` can carry over legacy
 * `isProduction` boolean cells (0 / 1) under the new column name when
 * TypeORM diffs the entity. Make sure every row holds a valid enum value
 * regardless of how it got there.
 */
export class NormalizeDatabaseMode1779000000002 implements MigrationInterface {
  name = 'NormalizeDatabaseMode1779000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "database_instance" SET "databaseMode" = 'production' WHERE "databaseMode" IN ('1', 1)`,
    );
    await queryRunner.query(
      `UPDATE "database_instance" SET "databaseMode" = 'unmarked' WHERE "databaseMode" NOT IN ('unmarked', 'production', 'fast')`,
    );
  }

  public async down(): Promise<void> {
    // No-op: there is nothing meaningful to restore.
  }
}
