import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "posts" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "colleges" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_colleges_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "article_tags" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_article_tags_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "contacts" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_contacts_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "merit_lists" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_merit_lists_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "notices" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_notices_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "events" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "jobs" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_jobs_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "tenders" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_tenders_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "faculties" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_faculties_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "departments" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_departments_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "programmes" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_programmes_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "offices" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_offices_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "campuses" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_campuses_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "people" ADD COLUMN "governance_verified_by_id" integer;
  ALTER TABLE "_people_v" ADD COLUMN "version_governance_verified_by_id" integer;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "colleges" ADD CONSTRAINT "colleges_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_colleges_v" ADD CONSTRAINT "_colleges_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_article_tags_v" ADD CONSTRAINT "_article_tags_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contacts_v" ADD CONSTRAINT "_contacts_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "merit_lists" ADD CONSTRAINT "merit_lists_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_merit_lists_v" ADD CONSTRAINT "_merit_lists_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "notices" ADD CONSTRAINT "notices_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_notices_v" ADD CONSTRAINT "_notices_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "jobs" ADD CONSTRAINT "jobs_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_jobs_v" ADD CONSTRAINT "_jobs_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tenders" ADD CONSTRAINT "tenders_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tenders_v" ADD CONSTRAINT "_tenders_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faculties" ADD CONSTRAINT "faculties_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faculties_v" ADD CONSTRAINT "_faculties_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departments" ADD CONSTRAINT "departments_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_departments_v" ADD CONSTRAINT "_departments_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "programmes" ADD CONSTRAINT "programmes_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_programmes_v" ADD CONSTRAINT "_programmes_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offices" ADD CONSTRAINT "offices_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_offices_v" ADD CONSTRAINT "_offices_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "campuses" ADD CONSTRAINT "campuses_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_campuses_v" ADD CONSTRAINT "_campuses_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_governance_verified_by_id_users_id_fk" FOREIGN KEY ("governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_people_v" ADD CONSTRAINT "_people_v_version_governance_verified_by_id_users_id_fk" FOREIGN KEY ("version_governance_verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_governance_governance_verified_by_idx" ON "pages" USING btree ("governance_verified_by_id");
  CREATE INDEX "_pages_v_version_governance_version_governance_verified__idx" ON "_pages_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "posts_governance_governance_verified_by_idx" ON "posts" USING btree ("governance_verified_by_id");
  CREATE INDEX "_posts_v_version_governance_version_governance_verified__idx" ON "_posts_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "colleges_governance_governance_verified_by_idx" ON "colleges" USING btree ("governance_verified_by_id");
  CREATE INDEX "_colleges_v_version_governance_version_governance_veri_1_idx" ON "_colleges_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "article_tags_governance_governance_verified_by_idx" ON "article_tags" USING btree ("governance_verified_by_id");
  CREATE INDEX "_article_tags_v_version_governance_version_governance__1_idx" ON "_article_tags_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "contacts_governance_governance_verified_by_idx" ON "contacts" USING btree ("governance_verified_by_id");
  CREATE INDEX "_contacts_v_version_governance_version_governance_veri_1_idx" ON "_contacts_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "merit_lists_governance_governance_verified_by_idx" ON "merit_lists" USING btree ("governance_verified_by_id");
  CREATE INDEX "_merit_lists_v_version_governance_version_governance_v_1_idx" ON "_merit_lists_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "notices_governance_governance_verified_by_idx" ON "notices" USING btree ("governance_verified_by_id");
  CREATE INDEX "_notices_v_version_governance_version_governance_verifie_idx" ON "_notices_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "events_governance_governance_verified_by_idx" ON "events" USING btree ("governance_verified_by_id");
  CREATE INDEX "_events_v_version_governance_version_governance_verified_idx" ON "_events_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "jobs_governance_governance_verified_by_idx" ON "jobs" USING btree ("governance_verified_by_id");
  CREATE INDEX "_jobs_v_version_governance_version_governance_verified_b_idx" ON "_jobs_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "tenders_governance_governance_verified_by_idx" ON "tenders" USING btree ("governance_verified_by_id");
  CREATE INDEX "_tenders_v_version_governance_version_governance_verifie_idx" ON "_tenders_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "faculties_governance_governance_verified_by_idx" ON "faculties" USING btree ("governance_verified_by_id");
  CREATE INDEX "_faculties_v_version_governance_version_governance_ver_1_idx" ON "_faculties_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "departments_governance_governance_verified_by_idx" ON "departments" USING btree ("governance_verified_by_id");
  CREATE INDEX "_departments_v_version_governance_version_governance_v_1_idx" ON "_departments_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "programmes_governance_governance_verified_by_idx" ON "programmes" USING btree ("governance_verified_by_id");
  CREATE INDEX "_programmes_v_version_governance_version_governance_ve_1_idx" ON "_programmes_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "offices_governance_governance_verified_by_idx" ON "offices" USING btree ("governance_verified_by_id");
  CREATE INDEX "_offices_v_version_governance_version_governance_verifie_idx" ON "_offices_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "campuses_governance_governance_verified_by_idx" ON "campuses" USING btree ("governance_verified_by_id");
  CREATE INDEX "_campuses_v_version_governance_version_governance_veri_1_idx" ON "_campuses_v" USING btree ("version_governance_verified_by_id");
  CREATE INDEX "people_governance_governance_verified_by_idx" ON "people" USING btree ("governance_verified_by_id");
  CREATE INDEX "_people_v_version_governance_version_governance_verified_idx" ON "_people_v" USING btree ("version_governance_verified_by_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP CONSTRAINT "pages_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "colleges" DROP CONSTRAINT "colleges_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_colleges_v" DROP CONSTRAINT "_colleges_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "article_tags" DROP CONSTRAINT "article_tags_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_article_tags_v" DROP CONSTRAINT "_article_tags_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "contacts" DROP CONSTRAINT "contacts_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_contacts_v" DROP CONSTRAINT "_contacts_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "merit_lists" DROP CONSTRAINT "merit_lists_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_merit_lists_v" DROP CONSTRAINT "_merit_lists_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "notices" DROP CONSTRAINT "notices_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_notices_v" DROP CONSTRAINT "_notices_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "jobs" DROP CONSTRAINT "jobs_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_jobs_v" DROP CONSTRAINT "_jobs_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "tenders" DROP CONSTRAINT "tenders_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_tenders_v" DROP CONSTRAINT "_tenders_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "faculties" DROP CONSTRAINT "faculties_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_faculties_v" DROP CONSTRAINT "_faculties_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "departments" DROP CONSTRAINT "departments_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_departments_v" DROP CONSTRAINT "_departments_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "programmes" DROP CONSTRAINT "programmes_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_programmes_v" DROP CONSTRAINT "_programmes_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "offices" DROP CONSTRAINT "offices_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_offices_v" DROP CONSTRAINT "_offices_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "campuses" DROP CONSTRAINT "campuses_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_campuses_v" DROP CONSTRAINT "_campuses_v_version_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "people" DROP CONSTRAINT "people_governance_verified_by_id_users_id_fk";
  
  ALTER TABLE "_people_v" DROP CONSTRAINT "_people_v_version_governance_verified_by_id_users_id_fk";
  
  DROP INDEX "pages_governance_governance_verified_by_idx";
  DROP INDEX "_pages_v_version_governance_version_governance_verified__idx";
  DROP INDEX "posts_governance_governance_verified_by_idx";
  DROP INDEX "_posts_v_version_governance_version_governance_verified__idx";
  DROP INDEX "colleges_governance_governance_verified_by_idx";
  DROP INDEX "_colleges_v_version_governance_version_governance_veri_1_idx";
  DROP INDEX "article_tags_governance_governance_verified_by_idx";
  DROP INDEX "_article_tags_v_version_governance_version_governance__1_idx";
  DROP INDEX "contacts_governance_governance_verified_by_idx";
  DROP INDEX "_contacts_v_version_governance_version_governance_veri_1_idx";
  DROP INDEX "merit_lists_governance_governance_verified_by_idx";
  DROP INDEX "_merit_lists_v_version_governance_version_governance_v_1_idx";
  DROP INDEX "notices_governance_governance_verified_by_idx";
  DROP INDEX "_notices_v_version_governance_version_governance_verifie_idx";
  DROP INDEX "events_governance_governance_verified_by_idx";
  DROP INDEX "_events_v_version_governance_version_governance_verified_idx";
  DROP INDEX "jobs_governance_governance_verified_by_idx";
  DROP INDEX "_jobs_v_version_governance_version_governance_verified_b_idx";
  DROP INDEX "tenders_governance_governance_verified_by_idx";
  DROP INDEX "_tenders_v_version_governance_version_governance_verifie_idx";
  DROP INDEX "faculties_governance_governance_verified_by_idx";
  DROP INDEX "_faculties_v_version_governance_version_governance_ver_1_idx";
  DROP INDEX "departments_governance_governance_verified_by_idx";
  DROP INDEX "_departments_v_version_governance_version_governance_v_1_idx";
  DROP INDEX "programmes_governance_governance_verified_by_idx";
  DROP INDEX "_programmes_v_version_governance_version_governance_ve_1_idx";
  DROP INDEX "offices_governance_governance_verified_by_idx";
  DROP INDEX "_offices_v_version_governance_version_governance_verifie_idx";
  DROP INDEX "campuses_governance_governance_verified_by_idx";
  DROP INDEX "_campuses_v_version_governance_version_governance_veri_1_idx";
  DROP INDEX "people_governance_governance_verified_by_idx";
  DROP INDEX "_people_v_version_governance_version_governance_verified_idx";
  ALTER TABLE "pages" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "posts" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "colleges" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_colleges_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "article_tags" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_article_tags_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "contacts" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_contacts_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "merit_lists" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_merit_lists_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "notices" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_notices_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "events" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "jobs" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_jobs_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "tenders" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_tenders_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "faculties" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_faculties_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "departments" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_departments_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "programmes" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_programmes_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "offices" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_offices_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "campuses" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_campuses_v" DROP COLUMN "version_governance_verified_by_id";
  ALTER TABLE "people" DROP COLUMN "governance_verified_by_id";
  ALTER TABLE "_people_v" DROP COLUMN "version_governance_verified_by_id";`)
}
