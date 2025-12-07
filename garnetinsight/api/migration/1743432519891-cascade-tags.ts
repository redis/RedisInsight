import { MigrationInterface, QueryRunner } from 'typeorm';

export class CascadeTags1743432519891 implements MigrationInterface {
  name = 'CascadeTags1743432519891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_3f0a9100c363114a8af7d1cae5"`);
    await queryRunner.query(`DROP INDEX "IDX_c1958471fa6e48e80e0dc4b27a"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_database_tag" ("databaseId" varchar NOT NULL, "tagId" varchar NOT NULL, CONSTRAINT "FK_c1958471fa6e48e80e0dc4b27a5" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("databaseId", "tagId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_database_tag"("databaseId", "tagId") SELECT "databaseId", "tagId" FROM "database_tag"`,
    );
    await queryRunner.query(`DROP TABLE "database_tag"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_database_tag" RENAME TO "database_tag"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3f0a9100c363114a8af7d1cae5" ON "database_tag" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c1958471fa6e48e80e0dc4b27a" ON "database_tag" ("databaseId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_3f0a9100c363114a8af7d1cae5"`);
    await queryRunner.query(`DROP INDEX "IDX_c1958471fa6e48e80e0dc4b27a"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_database_tag" ("databaseId" varchar NOT NULL, "tagId" varchar NOT NULL, CONSTRAINT "FK_c1958471fa6e48e80e0dc4b27a5" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_3f0a9100c363114a8af7d1cae55" FOREIGN KEY ("tagId") REFERENCES "tag" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("databaseId", "tagId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_database_tag"("databaseId", "tagId") SELECT "databaseId", "tagId" FROM "database_tag"`,
    );
    await queryRunner.query(`DROP TABLE "database_tag"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_database_tag" RENAME TO "database_tag"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3f0a9100c363114a8af7d1cae5" ON "database_tag" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c1958471fa6e48e80e0dc4b27a" ON "database_tag" ("databaseId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_c1958471fa6e48e80e0dc4b27a"`);
    await queryRunner.query(`DROP INDEX "IDX_3f0a9100c363114a8af7d1cae5"`);
    await queryRunner.query(
      `ALTER TABLE "database_tag" RENAME TO "temporary_database_tag"`,
    );
    await queryRunner.query(
      `CREATE TABLE "database_tag" ("databaseId" varchar NOT NULL, "tagId" varchar NOT NULL, CONSTRAINT "FK_c1958471fa6e48e80e0dc4b27a5" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("databaseId", "tagId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "database_tag"("databaseId", "tagId") SELECT "databaseId", "tagId" FROM "temporary_database_tag"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_database_tag"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_c1958471fa6e48e80e0dc4b27a" ON "database_tag" ("databaseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3f0a9100c363114a8af7d1cae5" ON "database_tag" ("tagId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_c1958471fa6e48e80e0dc4b27a"`);
    await queryRunner.query(`DROP INDEX "IDX_3f0a9100c363114a8af7d1cae5"`);
    await queryRunner.query(
      `ALTER TABLE "database_tag" RENAME TO "temporary_database_tag"`,
    );
    await queryRunner.query(
      `CREATE TABLE "database_tag" ("databaseId" varchar NOT NULL, "tagId" varchar NOT NULL, CONSTRAINT "FK_3f0a9100c363114a8af7d1cae55" FOREIGN KEY ("tagId") REFERENCES "tag" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_c1958471fa6e48e80e0dc4b27a5" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE CASCADE, PRIMARY KEY ("databaseId", "tagId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "database_tag"("databaseId", "tagId") SELECT "databaseId", "tagId" FROM "temporary_database_tag"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_database_tag"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_c1958471fa6e48e80e0dc4b27a" ON "database_tag" ("databaseId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3f0a9100c363114a8af7d1cae5" ON "database_tag" ("tagId") `,
    );
  }
}
