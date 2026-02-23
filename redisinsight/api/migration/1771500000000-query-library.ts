import { MigrationInterface, QueryRunner } from 'typeorm';

export class QueryLibrary1771500000000 implements MigrationInterface {
  name = 'QueryLibrary1771500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "query_library" (
        "id" varchar PRIMARY KEY NOT NULL,
        "databaseId" varchar NOT NULL,
        "indexName" varchar NOT NULL,
        "type" varchar NOT NULL DEFAULT ('SAVED'),
        "name" varchar NOT NULL,
        "description" text,
        "query" text NOT NULL,
        "encryption" varchar,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_query_library_databaseId" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_query_library_db_index_created" ON "query_library" ("databaseId", "indexName", "createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_query_library_db_index_created"`);
    await queryRunner.query(`DROP TABLE "query_library"`);
  }
}
