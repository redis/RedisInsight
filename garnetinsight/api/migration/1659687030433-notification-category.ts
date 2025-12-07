import { MigrationInterface, QueryRunner } from 'typeorm';

export class notificationCategory1659687030433 implements MigrationInterface {
  name = 'notificationCategory1659687030433';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_notification" ("type" varchar NOT NULL, "timestamp" integer NOT NULL, "title" varchar NOT NULL, "body" text NOT NULL, "read" boolean NOT NULL DEFAULT (0), "category" varchar, "categoryColor" varchar, PRIMARY KEY ("type", "timestamp"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_notification"("type", "timestamp", "title", "body", "read") SELECT "type", "timestamp", "title", "body", "read" FROM "notification"`,
    );
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_notification" RENAME TO "notification"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification" RENAME TO "temporary_notification"`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("type" varchar NOT NULL, "timestamp" integer NOT NULL, "title" varchar NOT NULL, "body" text NOT NULL, "read" boolean NOT NULL DEFAULT (0), PRIMARY KEY ("type", "timestamp"))`,
    );
    await queryRunner.query(
      `INSERT INTO "notification"("type", "timestamp", "title", "body", "read") SELECT "type", "timestamp", "title", "body", "read" FROM "temporary_notification"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_notification"`);
  }
}
