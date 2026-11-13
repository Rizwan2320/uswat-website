import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_rights_status" AS ENUM('owned', 'permission_granted', 'permission_pending', 'licensed', 'unknown');
  ALTER TABLE "media" ADD COLUMN "credit" varchar;
  ALTER TABLE "media" ADD COLUMN "rights_status" "enum_media_rights_status" DEFAULT 'unknown';
  ALTER TABLE "media" ADD COLUMN "source_url" varchar;
  ALTER TABLE "media" ADD COLUMN "source_page" varchar;
  ALTER TABLE "media" ADD COLUMN "sha256" varchar;
  CREATE INDEX "media_rights_status_idx" ON "media" USING btree ("rights_status");
  CREATE UNIQUE INDEX "media_sha256_idx" ON "media" USING btree ("sha256");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_rights_status_idx";
  DROP INDEX "media_sha256_idx";
  ALTER TABLE "media" DROP COLUMN "credit";
  ALTER TABLE "media" DROP COLUMN "rights_status";
  ALTER TABLE "media" DROP COLUMN "source_url";
  ALTER TABLE "media" DROP COLUMN "source_page";
  ALTER TABLE "media" DROP COLUMN "sha256";
  DROP TYPE "public"."enum_media_rights_status";`)
}
