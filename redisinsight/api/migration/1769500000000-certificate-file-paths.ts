import { MigrationInterface, QueryRunner } from 'typeorm';

export class CertificateFilePaths1769500000000 implements MigrationInterface {
  name = 'CertificateFilePaths1769500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add certificatePath column to ca_certificate table
    await queryRunner.query(
      `CREATE TABLE "temporary_ca_certificate" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "encryption" varchar, "certificate" varchar, "certificatePath" varchar, "isPreSetup" boolean, CONSTRAINT "UQ_23be613e4fb204fd5a66916b0b3" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_ca_certificate"("id", "name", "encryption", "certificate", "isPreSetup") SELECT "id", "name", "encryption", "certificate", "isPreSetup" FROM "ca_certificate"`,
    );
    await queryRunner.query(`DROP TABLE "ca_certificate"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_ca_certificate" RENAME TO "ca_certificate"`,
    );

    // Add certificatePath and keyPath columns to client_certificate table
    await queryRunner.query(
      `CREATE TABLE "temporary_client_certificate" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "encryption" varchar, "certificate" varchar, "certificatePath" varchar, "key" varchar, "keyPath" varchar, "isPreSetup" boolean, CONSTRAINT "UQ_4966cf1c0e299df01049ebd53a5" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_client_certificate"("id", "name", "encryption", "certificate", "key", "isPreSetup") SELECT "id", "name", "encryption", "certificate", "key", "isPreSetup" FROM "client_certificate"`,
    );
    await queryRunner.query(`DROP TABLE "client_certificate"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_client_certificate" RENAME TO "client_certificate"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove certificatePath and keyPath columns from client_certificate table
    await queryRunner.query(
      `ALTER TABLE "client_certificate" RENAME TO "temporary_client_certificate"`,
    );
    await queryRunner.query(
      `CREATE TABLE "client_certificate" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "encryption" varchar, "certificate" varchar, "key" varchar, "isPreSetup" boolean, CONSTRAINT "UQ_4966cf1c0e299df01049ebd53a5" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `INSERT INTO "client_certificate"("id", "name", "encryption", "certificate", "key", "isPreSetup") SELECT "id", "name", "encryption", "certificate", "key", "isPreSetup" FROM "temporary_client_certificate"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_client_certificate"`);

    // Remove certificatePath column from ca_certificate table
    await queryRunner.query(
      `ALTER TABLE "ca_certificate" RENAME TO "temporary_ca_certificate"`,
    );
    await queryRunner.query(
      `CREATE TABLE "ca_certificate" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "encryption" varchar, "certificate" varchar, "isPreSetup" boolean, CONSTRAINT "UQ_23be613e4fb204fd5a66916b0b3" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `INSERT INTO "ca_certificate"("id", "name", "encryption", "certificate", "isPreSetup") SELECT "id", "name", "encryption", "certificate", "isPreSetup" FROM "temporary_ca_certificate"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_ca_certificate"`);
  }
}

