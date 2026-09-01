import { MigrationInterface, QueryRunner } from 'typeorm';

export class PipelineDraft1784100000000 implements MigrationInterface {
  name = 'PipelineDraft1784100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pipeline_draft" (
        "id" varchar PRIMARY KEY NOT NULL,
        "rdiInstanceId" varchar NOT NULL,
        "data" text NOT NULL,
        "encryption" varchar,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_pipeline_draft_rdiInstanceId" FOREIGN KEY ("rdiInstanceId") REFERENCES "rdi" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_pipeline_draft_rdiInstanceId" ON "pipeline_draft" ("rdiInstanceId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_pipeline_draft_rdiInstanceId"`);
    await queryRunner.query(`DROP TABLE "pipeline_draft"`);
  }
}
