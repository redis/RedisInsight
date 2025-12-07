import { MigrationInterface, QueryRunner } from 'typeorm';

export class sshOptions1673035852335 implements MigrationInterface {
  name = 'sshOptions1673035852335';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ssh_options" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "encryption" varchar, "username" varchar, "password" varchar, "privateKey" varchar, "passphrase" varchar, "databaseId" varchar, CONSTRAINT "REL_fe3c3f8b1246e4824a3fb83047" UNIQUE ("databaseId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_database_instance" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "name" varchar NOT NULL, "username" varchar, "password" varchar, "tls" boolean, "verifyServerCert" boolean, "lastConnection" datetime, "caCertId" varchar, "clientCertId" varchar, "connectionType" varchar NOT NULL DEFAULT ('STANDALONE'), "nodes" varchar DEFAULT ('[]'), "nameFromProvider" varchar, "sentinelMasterName" varchar, "sentinelMasterUsername" varchar, "sentinelMasterPassword" varchar, "provider" varchar DEFAULT ('UNKNOWN'), "modules" varchar NOT NULL DEFAULT ('[]'), "db" integer, "encryption" varchar, "tlsServername" varchar, "new" boolean, "ssh" boolean, CONSTRAINT "FK_d1bc747b5938e22b4b708d8e9a5" FOREIGN KEY ("caCertId") REFERENCES "ca_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_3b9b625266c00feb2d66a9f36e4" FOREIGN KEY ("clientCertId") REFERENCES "client_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_database_instance"("id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes", "nameFromProvider", "sentinelMasterName", "sentinelMasterUsername", "sentinelMasterPassword", "provider", "modules", "db", "encryption", "tlsServername", "new") SELECT "id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes", "nameFromProvider", "sentinelMasterName", "sentinelMasterUsername", "sentinelMasterPassword", "provider", "modules", "db", "encryption", "tlsServername", "new" FROM "database_instance"`,
    );
    await queryRunner.query(`DROP TABLE "database_instance"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_database_instance" RENAME TO "database_instance"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_ssh_options" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "encryption" varchar, "username" varchar, "password" varchar, "privateKey" varchar, "passphrase" varchar, "databaseId" varchar, CONSTRAINT "REL_fe3c3f8b1246e4824a3fb83047" UNIQUE ("databaseId"), CONSTRAINT "FK_fe3c3f8b1246e4824a3fb83047d" FOREIGN KEY ("databaseId") REFERENCES "database_instance" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_ssh_options"("id", "host", "port", "encryption", "username", "password", "privateKey", "passphrase", "databaseId") SELECT "id", "host", "port", "encryption", "username", "password", "privateKey", "passphrase", "databaseId" FROM "ssh_options"`,
    );
    await queryRunner.query(`DROP TABLE "ssh_options"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_ssh_options" RENAME TO "ssh_options"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ssh_options" RENAME TO "temporary_ssh_options"`,
    );
    await queryRunner.query(
      `CREATE TABLE "ssh_options" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "encryption" varchar, "username" varchar, "password" varchar, "privateKey" varchar, "passphrase" varchar, "databaseId" varchar, CONSTRAINT "REL_fe3c3f8b1246e4824a3fb83047" UNIQUE ("databaseId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "ssh_options"("id", "host", "port", "encryption", "username", "password", "privateKey", "passphrase", "databaseId") SELECT "id", "host", "port", "encryption", "username", "password", "privateKey", "passphrase", "databaseId" FROM "temporary_ssh_options"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_ssh_options"`);
    await queryRunner.query(
      `ALTER TABLE "database_instance" RENAME TO "temporary_database_instance"`,
    );
    await queryRunner.query(
      `CREATE TABLE "database_instance" ("id" varchar PRIMARY KEY NOT NULL, "host" varchar NOT NULL, "port" integer NOT NULL, "name" varchar NOT NULL, "username" varchar, "password" varchar, "tls" boolean, "verifyServerCert" boolean, "lastConnection" datetime, "caCertId" varchar, "clientCertId" varchar, "connectionType" varchar NOT NULL DEFAULT ('STANDALONE'), "nodes" varchar DEFAULT ('[]'), "nameFromProvider" varchar, "sentinelMasterName" varchar, "sentinelMasterUsername" varchar, "sentinelMasterPassword" varchar, "provider" varchar DEFAULT ('UNKNOWN'), "modules" varchar NOT NULL DEFAULT ('[]'), "db" integer, "encryption" varchar, "tlsServername" varchar, "new" boolean, CONSTRAINT "FK_d1bc747b5938e22b4b708d8e9a5" FOREIGN KEY ("caCertId") REFERENCES "ca_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION, CONSTRAINT "FK_3b9b625266c00feb2d66a9f36e4" FOREIGN KEY ("clientCertId") REFERENCES "client_certificate" ("id") ON DELETE SET NULL ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "database_instance"("id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes", "nameFromProvider", "sentinelMasterName", "sentinelMasterUsername", "sentinelMasterPassword", "provider", "modules", "db", "encryption", "tlsServername", "new") SELECT "id", "host", "port", "name", "username", "password", "tls", "verifyServerCert", "lastConnection", "caCertId", "clientCertId", "connectionType", "nodes", "nameFromProvider", "sentinelMasterName", "sentinelMasterUsername", "sentinelMasterPassword", "provider", "modules", "db", "encryption", "tlsServername", "new" FROM "temporary_database_instance"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_database_instance"`);
    await queryRunner.query(`DROP TABLE "ssh_options"`);
  }
}
