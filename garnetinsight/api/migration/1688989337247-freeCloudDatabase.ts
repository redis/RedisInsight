import { MigrationInterface, QueryRunner } from 'typeorm';

export class FreeCloudDatabase1688989337247 implements MigrationInterface {
  name = 'FreeCloudDatabase1688989337247';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_database_cloud_details" ("id" varchar PRIMARY KEY NOT NULL, "cloudId" integer NOT NULL, "subscriptionType" varchar NOT NULL, "planMemoryLimit" integer, "memoryLimitMeasurementUnit" integer, "databaseId" varchar, "free" boolean DEFAULT (0), CONSTRAINT "REL_f41ee5027391b3be8ad95e3d15" UNIQUE ("databaseId"), CONSTRAINT "FK_f41ee5027391b3be8ad95e3d158" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_database_cloud_details"("id", "cloudId", "subscriptionType", "planMemoryLimit", "memoryLimitMeasurementUnit", "databaseId") SELECT "id", "cloudId", "subscriptionType", "planMemoryLimit", "memoryLimitMeasurementUnit", "databaseId" FROM "database_cloud_details"`,
    );
    await queryRunner.query(`DROP TABLE "database_cloud_details"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_database_cloud_details" RENAME TO "database_cloud_details"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_cloud_details" RENAME TO "temporary_database_cloud_details"`,
    );
    await queryRunner.query(
      `CREATE TABLE "database_cloud_details" ("id" varchar PRIMARY KEY NOT NULL, "cloudId" integer NOT NULL, "subscriptionType" varchar NOT NULL, "planMemoryLimit" integer, "memoryLimitMeasurementUnit" integer, "databaseId" varchar, CONSTRAINT "REL_f41ee5027391b3be8ad95e3d15" UNIQUE ("databaseId"), CONSTRAINT "FK_f41ee5027391b3be8ad95e3d158" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "database_cloud_details"("id", "cloudId", "subscriptionType", "planMemoryLimit", "memoryLimitMeasurementUnit", "databaseId") SELECT "id", "cloudId", "subscriptionType", "planMemoryLimit", "memoryLimitMeasurementUnit", "databaseId" FROM "temporary_database_cloud_details"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_database_cloud_details"`);
  }
}
