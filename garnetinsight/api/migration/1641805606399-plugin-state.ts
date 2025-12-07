import { MigrationInterface, QueryRunner } from 'typeorm';

export class pluginState1641805606399 implements MigrationInterface {
  name = 'pluginState1641805606399';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "plugin_state" ("commandExecutionId" varchar NOT NULL, "visualizationId" varchar NOT NULL, "state" text NOT NULL, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), PRIMARY KEY ("commandExecutionId", "visualizationId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_plugin_state" ("commandExecutionId" varchar NOT NULL, "visualizationId" varchar NOT NULL, "state" text NOT NULL, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_91b21bec94d7107162e34a03ceb" FOREIGN KEY ("commandExecutionId") REFERENCES "command_execution" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY ("commandExecutionId", "visualizationId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_plugin_state"("commandExecutionId", "visualizationId", "state", "encryption", "createdAt", "updatedAt") SELECT "commandExecutionId", "visualizationId", "state", "encryption", "createdAt", "updatedAt" FROM "plugin_state"`,
    );
    await queryRunner.query(`DROP TABLE "plugin_state"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_plugin_state" RENAME TO "plugin_state"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plugin_state" RENAME TO "temporary_plugin_state"`,
    );
    await queryRunner.query(
      `CREATE TABLE "plugin_state" ("commandExecutionId" varchar NOT NULL, "visualizationId" varchar NOT NULL, "state" text NOT NULL, "encryption" varchar, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), PRIMARY KEY ("commandExecutionId", "visualizationId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "plugin_state"("commandExecutionId", "visualizationId", "state", "encryption", "createdAt", "updatedAt") SELECT "commandExecutionId", "visualizationId", "state", "encryption", "createdAt", "updatedAt" FROM "temporary_plugin_state"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_plugin_state"`);
    await queryRunner.query(`DROP TABLE "plugin_state"`);
  }
}
