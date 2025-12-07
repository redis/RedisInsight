import { MigrationInterface, QueryRunner } from 'typeorm';

export class notification1655821010349 implements MigrationInterface {
  name = 'notification1655821010349';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification" ("type" varchar CHECK( type IN ('global') ) NOT NULL, "timestamp" integer NOT NULL, "title" varchar NOT NULL, "body" text NOT NULL, "read" boolean NOT NULL DEFAULT (0), PRIMARY KEY ("type", "timestamp"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "notification"`);
  }
}
