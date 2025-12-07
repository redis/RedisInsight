import { MigrationInterface, QueryRunner } from 'typeorm';

export class Rdi1716370509836 implements MigrationInterface {
  name = 'Rdi1716370509836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "rdi" ("id" varchar PRIMARY KEY NOT NULL, "url" varchar, "name" varchar NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "lastConnection" datetime, "version" varchar NOT NULL, "encryption" varchar)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "rdi"`);
  }
}
