import { MigrationInterface, QueryRunner } from 'typeorm';

export class AzureVerifyServerCert1785100000000 implements MigrationInterface {
  name = 'AzureVerifyServerCert1785100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE database_instance
            SET "verifyServerCert" = 1
            WHERE tls = 1
              AND "verifyServerCert" IS NULL
              AND provider IN ('AZURE_CACHE', 'AZURE_CACHE_REDIS_ENTERPRISE')
              AND "providerDetails" IS NOT NULL;
          `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Not reversible: cannot distinguish this backfill from a user-checked box.
  }
}
