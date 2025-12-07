import { MigrationInterface, QueryRunner } from 'typeorm';

export class initialMigration1614164490968 implements MigrationInterface {
  name = 'initialMigration1614164490968';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "client_certificate" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "certFilename" varchar NOT NULL, "keyFilename" varchar NOT NULL, CONSTRAINT "UQ_4966cf1c0e299df01049ebd53a5" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "database_instance" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "name" varchar NOT NULL, "username" varchar, "password" varchar, "tls" boolean NOT NULL, "verifyServerCert" boolean NOT NULL, "type" varchar NOT NULL DEFAULT ('Redis Database'), "lastConnection" datetime, "caCertId" varchar, "clientCertId" varchar)`,
    );
    await queryRunner.query(
      `CREATE TABLE "ca_certificate" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "filename" varchar NOT NULL, CONSTRAINT "UQ_23be613e4fb204fd5a66916b0b3" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_database_instance" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "name" varchar NOT NULL, "username" varchar, "password" varchar, "tls" boolean NOT NULL, "verifyServerCert" boolean NOT NULL, "type" varchar NOT NULL DEFAULT ('Redis Database'), "lastConnection" datetime, "caCertId" varchar, "clientCertId" varchar, CONSTRAINT "FK_d1bc747b5938e22b4b708d8e9a5" FOREIGN KEY ("caCertId") REFERENCES "ca_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_3b9b625266c00feb2d66a9f36e4" FOREIGN KEY ("clientCertId") REFERENCES "client_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_database_instance"("id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "type", "lastConnection", "caCertId", "clientCertId") SELECT "id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "type", "lastConnection", "caCertId", "clientCertId" FROM "database_instance"`,
    );
    await queryRunner.query(`DROP TABLE "database_instance"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_database_instance" RENAME TO "database_instance"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "database_instance" RENAME TO "temporary_database_instance"`,
    );
    await queryRunner.query(
      `CREATE TABLE "database_instance" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "name" varchar NOT NULL, "username" varchar, "password" varchar, "tls" boolean NOT NULL, "verifyServerCert" boolean NOT NULL, "type" varchar NOT NULL DEFAULT ('Redis Database'), "lastConnection" datetime, "caCertId" varchar, "clientCertId" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "database_instance"("id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "type", "lastConnection", "caCertId", "clientCertId") SELECT "id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "type", "lastConnection", "caCertId", "clientCertId" FROM "temporary_database_instance"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_database_instance"`);
    await queryRunner.query(`DROP TABLE "ca_certificate"`);
    await queryRunner.query(`DROP TABLE "database_instance"`);
    await queryRunner.query(`DROP TABLE "client_certificate"`);
  }
}
