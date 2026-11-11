import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "notices" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "notices_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "notices_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_notices_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_notices_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_notices_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "events" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "events_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "events_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_events_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_events_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "jobs" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "jobs_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "jobs_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_jobs_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_jobs_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_jobs_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "tenders" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "tenders_locales" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "tenders_locales" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "_tenders_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_tenders_v_locales" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_tenders_v_locales" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "redirects_rels" ADD COLUMN "notices_id" integer;
  ALTER TABLE "redirects_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "redirects_rels" ADD COLUMN "jobs_id" integer;
  ALTER TABLE "redirects_rels" ADD COLUMN "tenders_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "notices_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "jobs_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "tenders_id" integer;
  ALTER TABLE "notices" ADD CONSTRAINT "notices_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notices_v" ADD CONSTRAINT "_notices_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenders" ADD CONSTRAINT "tenders_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tenders_v" ADD CONSTRAINT "_tenders_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_notices_fk" FOREIGN KEY ("notices_id") REFERENCES "public"."notices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_tenders_fk" FOREIGN KEY ("tenders_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_notices_fk" FOREIGN KEY ("notices_id") REFERENCES "public"."notices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_tenders_fk" FOREIGN KEY ("tenders_id") REFERENCES "public"."tenders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "notices_meta_meta_image_idx" ON "notices" USING btree ("meta_image_id");
  CREATE INDEX "_notices_v_version_meta_version_meta_image_idx" ON "_notices_v" USING btree ("version_meta_image_id");
  CREATE INDEX "events_meta_meta_image_idx" ON "events" USING btree ("meta_image_id");
  CREATE INDEX "_events_v_version_meta_version_meta_image_idx" ON "_events_v" USING btree ("version_meta_image_id");
  CREATE INDEX "jobs_meta_meta_image_idx" ON "jobs" USING btree ("meta_image_id");
  CREATE INDEX "_jobs_v_version_meta_version_meta_image_idx" ON "_jobs_v" USING btree ("version_meta_image_id");
  CREATE INDEX "tenders_meta_meta_image_idx" ON "tenders" USING btree ("meta_image_id");
  CREATE INDEX "_tenders_v_version_meta_version_meta_image_idx" ON "_tenders_v" USING btree ("version_meta_image_id");
  CREATE INDEX "redirects_rels_notices_id_idx" ON "redirects_rels" USING btree ("notices_id");
  CREATE INDEX "redirects_rels_events_id_idx" ON "redirects_rels" USING btree ("events_id");
  CREATE INDEX "redirects_rels_jobs_id_idx" ON "redirects_rels" USING btree ("jobs_id");
  CREATE INDEX "redirects_rels_tenders_id_idx" ON "redirects_rels" USING btree ("tenders_id");
  CREATE INDEX "search_rels_pages_id_idx" ON "search_rels" USING btree ("pages_id");
  CREATE INDEX "search_rels_notices_id_idx" ON "search_rels" USING btree ("notices_id");
  CREATE INDEX "search_rels_events_id_idx" ON "search_rels" USING btree ("events_id");
  CREATE INDEX "search_rels_jobs_id_idx" ON "search_rels" USING btree ("jobs_id");
  CREATE INDEX "search_rels_tenders_id_idx" ON "search_rels" USING btree ("tenders_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "notices" DROP CONSTRAINT "notices_meta_image_id_media_id_fk";
  
  ALTER TABLE "_notices_v" DROP CONSTRAINT "_notices_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_meta_image_id_media_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "jobs" DROP CONSTRAINT "jobs_meta_image_id_media_id_fk";
  
  ALTER TABLE "_jobs_v" DROP CONSTRAINT "_jobs_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "tenders" DROP CONSTRAINT "tenders_meta_image_id_media_id_fk";
  
  ALTER TABLE "_tenders_v" DROP CONSTRAINT "_tenders_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_notices_fk";
  
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_events_fk";
  
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_jobs_fk";
  
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_tenders_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_pages_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_notices_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_events_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_jobs_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_tenders_fk";
  
  DROP INDEX "notices_meta_meta_image_idx";
  DROP INDEX "_notices_v_version_meta_version_meta_image_idx";
  DROP INDEX "events_meta_meta_image_idx";
  DROP INDEX "_events_v_version_meta_version_meta_image_idx";
  DROP INDEX "jobs_meta_meta_image_idx";
  DROP INDEX "_jobs_v_version_meta_version_meta_image_idx";
  DROP INDEX "tenders_meta_meta_image_idx";
  DROP INDEX "_tenders_v_version_meta_version_meta_image_idx";
  DROP INDEX "redirects_rels_notices_id_idx";
  DROP INDEX "redirects_rels_events_id_idx";
  DROP INDEX "redirects_rels_jobs_id_idx";
  DROP INDEX "redirects_rels_tenders_id_idx";
  DROP INDEX "search_rels_pages_id_idx";
  DROP INDEX "search_rels_notices_id_idx";
  DROP INDEX "search_rels_events_id_idx";
  DROP INDEX "search_rels_jobs_id_idx";
  DROP INDEX "search_rels_tenders_id_idx";
  ALTER TABLE "notices" DROP COLUMN "meta_image_id";
  ALTER TABLE "notices_locales" DROP COLUMN "meta_title";
  ALTER TABLE "notices_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_notices_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_notices_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_notices_v_locales" DROP COLUMN "version_meta_description";
  ALTER TABLE "events" DROP COLUMN "meta_image_id";
  ALTER TABLE "events_locales" DROP COLUMN "meta_title";
  ALTER TABLE "events_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_events_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_events_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_events_v_locales" DROP COLUMN "version_meta_description";
  ALTER TABLE "jobs" DROP COLUMN "meta_image_id";
  ALTER TABLE "jobs_locales" DROP COLUMN "meta_title";
  ALTER TABLE "jobs_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_jobs_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_jobs_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_jobs_v_locales" DROP COLUMN "version_meta_description";
  ALTER TABLE "tenders" DROP COLUMN "meta_image_id";
  ALTER TABLE "tenders_locales" DROP COLUMN "meta_title";
  ALTER TABLE "tenders_locales" DROP COLUMN "meta_description";
  ALTER TABLE "_tenders_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_tenders_v_locales" DROP COLUMN "version_meta_title";
  ALTER TABLE "_tenders_v_locales" DROP COLUMN "version_meta_description";
  ALTER TABLE "redirects_rels" DROP COLUMN "notices_id";
  ALTER TABLE "redirects_rels" DROP COLUMN "events_id";
  ALTER TABLE "redirects_rels" DROP COLUMN "jobs_id";
  ALTER TABLE "redirects_rels" DROP COLUMN "tenders_id";
  ALTER TABLE "search_rels" DROP COLUMN "pages_id";
  ALTER TABLE "search_rels" DROP COLUMN "notices_id";
  ALTER TABLE "search_rels" DROP COLUMN "events_id";
  ALTER TABLE "search_rels" DROP COLUMN "jobs_id";
  ALTER TABLE "search_rels" DROP COLUMN "tenders_id";`)
}
