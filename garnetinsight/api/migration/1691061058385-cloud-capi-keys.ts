import { MigrationInterface, QueryRunner } from 'typeorm';

export class CloudCapiKeys1691061058385 implements MigrationInterface {
  name = 'CloudCapiKeys1691061058385';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "cloud_capi_key" ("id" varchar PRIMARY KEY NOT NULL, "userId" varchar NOT NULL, "name" varchar NOT NULL, "cloudAccountId" integer NOT NULL, "cloudUserId" integer NOT NULL, "capiKey" varchar, "capiSecret" varchar, "valid" boolean DEFAULT (1), "encryption" varchar, "createdAt" datetime, "lastUsed" datetime, CONSTRAINT "UQ_9de67df9deb5d91c09c03b8d719" UNIQUE ("userId", "cloudAccountId", "cloudUserId"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "cloud_capi_key"`);
  }
}
