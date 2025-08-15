import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProviderNames1755086732238 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE database_instance
            SET provider = CASE provider
                WHEN 'RE_CLOUD' THEN 'REDIS_CLOUD'
                WHEN 'RE_CLUSTER' THEN 'REDIS_SOFTWARE'
                WHEN 'REDIS_ENTERPRISE' THEN 'OTHER_REDIS_MANAGED'
                ELSE provider
            END
            WHERE provider IN ('RE_CLOUD', 'RE_CLUSTER');
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE database_instance
            SET provider = CASE provider
                WHEN 'REDIS_CLOUD' THEN 'RE_CLOUD'
                WHEN 'REDIS_SOFTWARE' THEN 'RE_CLUSTER'
                WHEN 'OTHER_REDIS_MANAGED' THEN 'REDIS_ENTERPRISE'
                ELSE provider
            END
            WHERE provider IN ('REDIS_CLOUD', 'REDIS_SOFTWARE');
          `);
  }
}
