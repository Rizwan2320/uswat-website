import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_content" ADD COLUMN "leadership_photo_id" integer;
  ALTER TABLE "_home_content_v" ADD COLUMN "version_leadership_photo_id" integer;
  ALTER TABLE "home_content" ADD CONSTRAINT "home_content_leadership_photo_id_media_id_fk" FOREIGN KEY ("leadership_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_content_v" ADD CONSTRAINT "_home_content_v_version_leadership_photo_id_media_id_fk" FOREIGN KEY ("version_leadership_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_content_leadership_leadership_photo_idx" ON "home_content" USING btree ("leadership_photo_id");
  CREATE INDEX "_home_content_v_version_leadership_version_leadership_ph_idx" ON "_home_content_v" USING btree ("version_leadership_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_content" DROP CONSTRAINT "home_content_leadership_photo_id_media_id_fk";
  
  ALTER TABLE "_home_content_v" DROP CONSTRAINT "_home_content_v_version_leadership_photo_id_media_id_fk";
  
  DROP INDEX "home_content_leadership_leadership_photo_idx";
  DROP INDEX "_home_content_v_version_leadership_version_leadership_ph_idx";
  ALTER TABLE "home_content" DROP COLUMN "leadership_photo_id";
  ALTER TABLE "_home_content_v" DROP COLUMN "version_leadership_photo_id";`)
}
