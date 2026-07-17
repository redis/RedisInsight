import { MigrationInterface, QueryRunner } from 'typeorm';

export class AgentMemoryEndpoint1779100000000 implements MigrationInterface {
  name = 'AgentMemoryEndpoint1779100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "agent_memory_endpoint" (
        "id" varchar PRIMARY KEY NOT NULL,
        "name" varchar NOT NULL,
        "url" varchar NOT NULL,
        "backendType" varchar NOT NULL DEFAULT ('oss'),
        "storeId" varchar,
        "apiKey" varchar,
        "lastConnection" datetime,
        "encryption" varchar
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "agent_memory_endpoint"`);
  }
}
